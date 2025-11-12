"""
@AI-HINT: Oracle Cloud Infrastructure (OCI) Object Storage client for file uploads and management.
Replaces AWS S3 functionality with OCI Object Storage (Always Free tier eligible - 10GB).
"""

from typing import Optional
import oci
from oci.exceptions import ServiceError
import logging
from datetime import datetime, timedelta

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class OCIStorageClient:
    """
    Oracle Cloud Infrastructure Object Storage client
    Provides file upload, download, delete, and URL generation capabilities
    Compatible with OCI Always Free tier (10GB storage)
    """
    
    def __init__(self):
        """
        Initialize OCI Object Storage client
        Uses config from ~/.oci/config or instance principal authentication
        """
        self.object_storage_client = None
        self.config = None
        
        try:
            # Try instance principal authentication (for VMs in OCI)
            signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
            self.config = {'region': settings.oci_region}
            self.object_storage_client = oci.object_storage.ObjectStorageClient(
                config=self.config, 
                signer=signer
            )
            logger.info("Initialized OCI Storage with instance principal authentication")
        except Exception as e:
            # Fall back to config file authentication
            try:
                self.config = oci.config.from_file(
                    profile_name=settings.oci_profile or "DEFAULT"
                )
                self.object_storage_client = oci.object_storage.ObjectStorageClient(self.config)
                logger.info(f"Initialized OCI Storage with config file (profile: {settings.oci_profile or 'DEFAULT'})")
            except Exception as config_error:
                logger.warning(f"OCI Storage not configured (optional for demo): {config_error}")
                # Don't raise - OCI storage is optional for demo
        
        # Get namespace
        try:
            self.namespace = self.object_storage_client.get_namespace().data
            logger.info(f"OCI Object Storage namespace: {self.namespace}")
        except Exception as e:
            logger.error(f"Failed to get OCI namespace: {e}")
            self.namespace = settings.oci_namespace
    
    def upload_file(
        self,
        file_obj,
        bucket_name: str,
        object_name: str,
        content_type: Optional[str] = None
    ) -> Optional[str]:
        """
        Upload a file to OCI Object Storage bucket
        
        Args:
            file_obj: File object to upload
            bucket_name: Target OCI bucket name
            object_name: Object name (key)
            content_type: MIME type of the file
            
        Returns:
            Public URL of uploaded file or None if failed
        """
        try:
            # Read file content
            file_content = file_obj.read()
            
            # Prepare upload details
            put_object_kwargs = {
                'namespace_name': self.namespace,
                'bucket_name': bucket_name,
                'object_name': object_name,
                'put_object_body': file_content
            }
            
            if content_type:
                put_object_kwargs['content_type'] = content_type
            
            # Upload to OCI Object Storage
            self.object_storage_client.put_object(**put_object_kwargs)
            
            # Generate public URL
            url = f"https://objectstorage.{settings.oci_region}.oraclecloud.com/n/{self.namespace}/b/{bucket_name}/o/{object_name}"
            logger.info(f"File uploaded successfully to {url}")
            return url
            
        except ServiceError as e:
            logger.error(f"Error uploading file to OCI Object Storage: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {e}")
            return None
    
    def generate_presigned_url(
        self,
        bucket_name: str,
        object_name: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate a pre-authenticated request (PAR) URL for temporary access
        
        Args:
            bucket_name: OCI bucket name
            object_name: Object key
            expiration: URL expiration time in seconds
            
        Returns:
            Pre-authenticated URL or None if failed
        """
        try:
            # Calculate expiration time
            expiration_time = datetime.utcnow() + timedelta(seconds=expiration)
            
            # Create PAR
            create_par_details = oci.object_storage.models.CreatePreauthenticatedRequestDetails(
                name=f"temp-access-{object_name}-{int(datetime.utcnow().timestamp())}",
                access_type="ObjectRead",
                time_expires=expiration_time,
                object_name=object_name
            )
            
            par = self.object_storage_client.create_preauthenticated_request(
                namespace_name=self.namespace,
                bucket_name=bucket_name,
                create_preauthenticated_request_details=create_par_details
            )
            
            # Construct full URL
            url = f"https://objectstorage.{settings.oci_region}.oraclecloud.com{par.data.access_uri}"
            logger.info(f"Generated pre-authenticated URL (expires in {expiration}s)")
            return url
            
        except ServiceError as e:
            logger.error(f"Error generating pre-authenticated URL: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error generating URL: {e}")
            return None
    
    def delete_file(self, bucket_name: str, object_name: str) -> bool:
        """
        Delete a file from OCI Object Storage bucket
        
        Args:
            bucket_name: OCI bucket name
            object_name: Object key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.object_storage_client.delete_object(
                namespace_name=self.namespace,
                bucket_name=bucket_name,
                object_name=object_name
            )
            logger.info(f"File deleted successfully: {object_name}")
            return True
            
        except ServiceError as e:
            logger.error(f"Error deleting file from OCI Object Storage: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting file: {e}")
            return False
    
    def list_files(self, bucket_name: str, prefix: str = "") -> list:
        """
        List files in OCI Object Storage bucket with optional prefix
        
        Args:
            bucket_name: OCI bucket name
            prefix: Object key prefix to filter
            
        Returns:
            List of object names
        """
        try:
            # List objects
            list_objects_response = self.object_storage_client.list_objects(
                namespace_name=self.namespace,
                bucket_name=bucket_name,
                prefix=prefix if prefix else None
            )
            
            if list_objects_response.data.objects:
                return [obj.name for obj in list_objects_response.data.objects]
            return []
            
        except ServiceError as e:
            logger.error(f"Error listing files from OCI Object Storage: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error listing files: {e}")
            return []
    
    def get_file_metadata(self, bucket_name: str, object_name: str) -> Optional[dict]:
        """
        Get metadata for a file in OCI Object Storage
        
        Args:
            bucket_name: OCI bucket name
            object_name: Object key
            
        Returns:
            Dictionary with file metadata or None if failed
        """
        try:
            head_object_response = self.object_storage_client.head_object(
                namespace_name=self.namespace,
                bucket_name=bucket_name,
                object_name=object_name
            )
            
            return {
                'content_length': head_object_response.headers.get('content-length'),
                'content_type': head_object_response.headers.get('content-type'),
                'etag': head_object_response.headers.get('etag'),
                'last_modified': head_object_response.headers.get('last-modified')
            }
            
        except ServiceError as e:
            logger.error(f"Error getting file metadata: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting metadata: {e}")
            return None


# Singleton instance
oci_storage_client = OCIStorageClient()


def get_oci_storage_client() -> OCIStorageClient:
    """Dependency for FastAPI routes"""
    return oci_storage_client

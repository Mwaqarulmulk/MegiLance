import api, { ResourceId } from '@/lib/api';
import { uploadsApi } from '@/lib/api';
import { errorToString } from './base.service';

export interface ProfileData {
  bio?: string;
  skills?: string;
  title?: string;
  hourly_rate?: number;
  location?: string;
  avatar_url?: string;
}

export async function fetchUserProfile(userId?: ResourceId) {
  try {
    if (userId) {
      return await api.users.get(userId);
    }
    return await api.auth.me();
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to load profile'));
  }
}

export async function updateProfile(data: ProfileData) {
  try {
    return await api.auth.updateProfile(data);
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to update profile'));
  }
}

export async function uploadAvatar(file: File) {
  try {
    return await api.uploads.upload('avatar', file);
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to upload avatar'));
  }
}

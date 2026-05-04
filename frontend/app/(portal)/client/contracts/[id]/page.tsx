import ContractDetail from './ContractDetail';

// @AI-HINT: Page wrapper for ContractDetail component
export default function ContractDetailPage({ params }: { params: { id: string } }) {
  return <ContractDetail contractId={parseInt(params.id)} />;
}

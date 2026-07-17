// Route entrypoint for the production proposal workflow.
// Keep the API-backed implementation in SubmitProposal.tsx so the route does
// not regress to a local demo when the workflow is updated.
import SubmitProposal from './SubmitProposal';

export default function SubmitProposalPage() {
  return <SubmitProposal />;
}

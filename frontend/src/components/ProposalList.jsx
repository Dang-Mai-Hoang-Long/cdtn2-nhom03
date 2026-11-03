import React from 'react';
import { ProposalCards } from './Ui.jsx';

export default function ProposalList({ selectable = false }) {
  return <ProposalCards selectable={selectable} />;
}

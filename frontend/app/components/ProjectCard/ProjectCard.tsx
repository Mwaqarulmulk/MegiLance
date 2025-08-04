// @AI-HINT: This is the ProjectCard component for displaying project summaries in lists and dashboards. All styles are per-component only. See ProjectCard.common.css, ProjectCard.light.css, and ProjectCard.dark.css for theming.
import React from "react";
import Card from "../Card/Card";
import Button from "../Button/Button";
import "./ProjectCard.common.css";
import "./ProjectCard.light.css";
import "./ProjectCard.dark.css";

export interface ProjectCardProps {
  theme?: "light" | "dark";
  title: string;
  client: string;
  budget: string;
  status: "active" | "completed" | "pending";
  onView?: () => void;
}

const statusColors = {
  active: "ProjectCard-status--active",
  completed: "ProjectCard-status--completed",
  pending: "ProjectCard-status--pending"
};

const ProjectCard: React.FC<ProjectCardProps> = ({ theme = "light", title, client, budget, status, onView }) => {
  return (
    <Card theme={theme}>
      <div className="ProjectCard-header">
        <h3 className="ProjectCard-title">{title}</h3>
        <span className={`ProjectCard-status ${statusColors[status]}`}>{status}</span>
      </div>
      <div className="ProjectCard-info">
        <span className="ProjectCard-client">Client: {client}</span>
        <span className="ProjectCard-budget">Budget: {budget}</span>
      </div>
      <Button theme={theme} variant="secondary" onClick={onView}>View Details</Button>
    </Card>
  );
};

export default ProjectCard;

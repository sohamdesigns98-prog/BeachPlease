import { Link } from "react-router-dom";

export default function BackToExperienceLink({ label = "back to experience" }) {
  return (
    <Link className="back-to-experience" to="/experience/mood">
      {label}
    </Link>
  );
}

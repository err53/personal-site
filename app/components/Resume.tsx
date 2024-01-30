import { Card, CardHeader } from "./ui/Card";

export const Resume = () => (
  <div>
    <h2 className="text-3xl font-semibold">Resume</h2>
    <div className="pt-3">
      <Card label="Resume" href="https://err53.github.io/resume/resume.pdf">
        <CardHeader>
          <h3 className="text-2xl">PDF</h3>
          <p>Written in LaTeX and compiled via GH Actions</p>
        </CardHeader>
      </Card>
    </div>
  </div>
);

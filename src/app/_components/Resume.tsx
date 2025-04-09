import { Card, CardHeader } from "./ui/Card";

export const Resume = () => (
  <div>
    <h2 className="pb-3 text-3xl font-semibold">Resume</h2>
    <div>
      <Card href="https://err53.github.io/resume/resume.pdf">
        <CardHeader>
          <h3 className="text-2xl">PDF</h3>
          <p>Written in LaTeX and compiled via GH Actions</p>
        </CardHeader>
      </Card>
    </div>
  </div>
);

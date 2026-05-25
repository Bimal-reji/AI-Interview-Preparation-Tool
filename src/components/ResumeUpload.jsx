import { Button, Card } from "@jamsr-ui/react";

export default function ResumeUpload() {
  return (
    <div className="container mt-32 text-center">

      <h2 className="text-4xl font-bold mb-4">
        Upload Resume for AI Analysis
      </h2>

      <p className="text-gray-400 mb-8">
        Our AI will analyze your resume and suggest improvements
      </p>

      <Card className="p-10 border-dashed border-2 border-gray-600 bg-white/5 backdrop-blur-md">

        <input type="file" className="mb-6" />

        <Button>
          Analyze Resume
        </Button>

      </Card>
    </div>
  );
}
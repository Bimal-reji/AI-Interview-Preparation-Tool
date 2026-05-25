import { Button } from "@jamsr-ui/react";
import { useNavigate } from "react-router-dom";

export default function ResumeRequired() {

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">

      <h1 className="text-3xl font-bold mb-4">
        Upload Your Resume First
      </h1>

      <p className="text-gray-600 mb-6 max-w-md">
        To generate personalized questions and mock interviews, 
        we need to analyze your resume first.
      </p>

      <Button
        className="bg-orange-500 text-white hover:bg-orange-600"
        onClick={() => navigate("/resume")}
      >
        Go to Resume Upload
      </Button>

    </div>
  );
}
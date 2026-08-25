import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ResumeModalProps {
  onClose: () => void;
}

export function ResumeModal({ onClose }: ResumeModalProps) {
  const [resume, setResume] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const generateResume = useAction(api.ai.generateResume);

  const handleGenerate = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const generatedResume = await generateResume({ userId: currentUser.id });
      setResume(generatedResume);
      toast.success("Resume generated successfully!");
    } catch (error) {
      toast.error("Failed to generate resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resume);
    toast.success("Resume copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser?.profile?.name || 'Arc'}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">📄 Arc Resume</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Generate a professional resume based on your completed goals and achievements in Arc.
            This resume highlights the skills you've developed and projects you've completed.
          </p>
          
          {!resume && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating Resume...
                </div>
              ) : (
                "✨ Generate My Resume"
              )}
            </button>
          )}
        </div>

        {resume && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                📋 Copy to Clipboard
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                💾 Download
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                🔄 Regenerate
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <pre className="text-gray-100 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {resume}
              </pre>
            </div>
          </div>
        )}

        {!resume && !loading && (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate Your Resume?</h3>
            <p className="text-gray-300 text-sm">
              Your Arc resume will showcase all the goals you've completed and skills you've developed.
              The more goals you complete, the stronger your resume becomes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

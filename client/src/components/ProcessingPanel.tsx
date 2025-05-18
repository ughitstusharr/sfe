interface ProcessingPanelProps {
  title: string;
  message: string;
}

export default function ProcessingPanel({ title, message }: ProcessingPanelProps) {
  return (
    <div className="p-6">
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

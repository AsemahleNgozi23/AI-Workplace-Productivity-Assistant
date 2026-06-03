import { AlertTriangle } from "lucide-react";

export function ResponsibleAIDisclaimer() {
  return (
    <div className="border-t border-border bg-muted/50 px-6 py-3">
      <div className="mx-auto flex max-w-5xl items-start gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p>
          <strong>Responsible AI Notice:</strong> AI-generated outputs are suggestions and may contain inaccuracies. Always review and verify content before using it in professional contexts. AI does not replace human judgment. Your conversations may be processed to improve the service.
        </p>
      </div>
    </div>
  );
}

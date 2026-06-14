import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ChildEmailCardProps {
  email: string | undefined;
}

const ChildEmailCard = ({ email }: ChildEmailCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Email copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5 text-primary" />
          My Email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground break-all flex-1">
            {email || "Loading..."}
          </span>
          {email && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildEmailCard;

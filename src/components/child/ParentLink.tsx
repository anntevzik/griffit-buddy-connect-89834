import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, CheckCircle, AlertCircle } from "lucide-react";

interface ParentLinkProps {
  childId: string;
  currentParentId: string | null;
}

const ParentLink = ({ childId, currentParentId }: ParentLinkProps) => {
  const { toast } = useToast();
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [parentName, setParentName] = useState<string | null>(null);

  useEffect(() => {
    if (currentParentId) {
      loadParentInfo();
    }
  }, [currentParentId]);

  const loadParentInfo = async () => {
    if (!currentParentId) return;

    const { data, error } = await supabase
      .from("parents")
      .select("full_name")
      .eq("id", currentParentId)
      .single();

    if (!error && data) {
      setParentName(data.full_name);
    }
  };

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your parent's email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Use security definer function to look up parent by email
      const { data: parentId, error: rpcError } = await supabase
        .rpc("get_parent_id_by_email", { p_email: parentEmail });

      if (rpcError || !parentId) {
        toast({
          title: "Parent Not Found",
          description: "No parent account found with this email",
          variant: "destructive",
        });
        return;
      }

      // Update child's parent_id
      const { error: updateError } = await supabase
        .from("children")
        .update({ parent_id: parentId })
        .eq("id", childId);

      if (updateError) throw updateError;

      toast({
        title: "Success!",
        description: "Your account has been linked to your parent",
      });

      setParentEmail("");
      window.location.reload(); // Refresh to show updated status
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link parent account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("children")
        .update({ parent_id: null })
        .eq("id", childId);

      if (error) throw error;

      toast({
        title: "Unlinked",
        description: "Your parent account has been unlinked",
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink parent account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Parent Connection
        </CardTitle>
        <CardDescription>
          {currentParentId
            ? "Your account is connected to a parent"
            : "Link your account to your parent for progress sharing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentParentId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Linked to: {parentName || "Parent Account"}</span>
            </div>
            <Button
              onClick={handleUnlink}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Unlink Parent Account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLinkParent} className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>Ask your parent for their email address</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-email">Parent's Email</Label>
              <Input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Linking..." : "Link Parent Account"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentLink;

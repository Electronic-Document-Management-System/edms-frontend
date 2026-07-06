"use client";

import { useEffect, useMemo, useState } from "react";
import { Share2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { usePermission } from "@/hooks/usePermission";
import { getAllUsers } from "@/features/users/users.api";
import { User } from "@/features/users/users.types";

import {
  getDocumentShares,
  revokeDocumentShare,
  shareDocument,
} from "@/features/documentShare/documentShare.api";
import { DocumentShare, SharePermission } from "@/features/documentShare/documentShare.types";

type DocumentShareCardProps = {
  documentId: number;
};

export function DocumentShareCard({ documentId }: DocumentShareCardProps) {
  const { can } = usePermission();

  const canShare =
    can("documentShare:create:own") ||
    can("documentShare:create:department") ||
    can("documentShare:create:all");

  const canRevoke =
    can("documentShare:delete:own") ||
    can("documentShare:delete:department") ||
    can("documentShare:delete:all");

  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permission, setPermission] = useState<SharePermission>("VIEW");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Revoke dialog
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<DocumentShare | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchShares = async () => {
    try {
      setIsLoading(true);
      const data = await getDocumentShares(documentId);
      setShares(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load shares.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [documentId]);

  const sharedUserIds = useMemo(
    () => new Set(shares.filter((s) => !s.isRevoked).map((s) => s.sharedWithUserId)),
    [shares]
  );

  const availableUsers = useMemo(
    () => users.filter((u) => !sharedUserIds.has(u.id)),
    [users, sharedUserIds]
  );

  const openShareDialog = async () => {
    try {
      if (users.length === 0) {
        const usersData = await getAllUsers();
        setUsers(usersData);
      }
      setSelectedUserId("");
      setPermission("VIEW");
      setMessage("");
      setExpiresAt("");
      setShareDialogOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load users.");
    }
  };

  const handleShare = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user.");
      return;
    }

    try {
      setIsSharing(true);
      await shareDocument(documentId, {
        sharedWithUserId: Number(selectedUserId),
        permission,
        message: message.trim() || undefined,
        expiresAt: expiresAt || undefined,
      });
      toast.success("Document shared successfully.");
      setShareDialogOpen(false);
      await fetchShares();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to share document.");
    } finally {
      setIsSharing(false);
    }
  };

  const openRevokeDialog = (share: DocumentShare) => {
    setSelectedShare(share);
    setRevokeDialogOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedShare) return;

    try {
      setIsRevoking(true);
      await revokeDocumentShare(documentId, selectedShare.id);
      toast.success("Share revoked successfully.");
      setRevokeDialogOpen(false);
      setSelectedShare(null);
      await fetchShares();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke share.");
      setRevokeDialogOpen(false);
    } finally {
      setIsRevoking(false);
    }
  };

  const activeShares = shares.filter((s) => !s.isRevoked);
  const revokedShares = shares.filter((s) => s.isRevoked);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Shared With
        </CardTitle>

        {canShare && (
          <Button size="sm" onClick={openShareDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading shares...</p>
        ) : activeShares.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This document has not been shared with anyone.
          </p>
        ) : (
          <div className="space-y-2">
            {activeShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {share.sharedWithUser.name}
                    </span>
                    <Badge variant={share.permission === "DOWNLOAD" ? "default" : "secondary"}>
                      {share.permission}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {share.sharedWithUser.email}
                  </p>
                  {share.message && (
                    <p className="text-xs italic text-muted-foreground">
                      "{share.message}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Shared by {share.sharedByUser.name} ·{" "}
                    {new Date(share.createdAt).toLocaleDateString()}
                    {share.expiresAt && (
                      <> · Expires {new Date(share.expiresAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>

                {canRevoke && (
                  <ActionTooltip
                    label="Revoke access"
                    tooltipClassName="bg-red-600 text-white"
                    arrowClassName="fill-red-600"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openRevokeDialog(share)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </ActionTooltip>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Revoked shares — collapsed */}
        {revokedShares.length > 0 && (
          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Revoked ({revokedShares.length})
            </p>
            <div className="space-y-1">
              {revokedShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground line-through"
                >
                  <span>{share.sharedWithUser.name}</span>
                  <span>·</span>
                  <span>{share.permission}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Share with</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permission</Label>
              <Select
                value={permission}
                onValueChange={(val) => setPermission(val as SharePermission)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW">View only</SelectItem>
                  <SelectItem value="DOWNLOAD">View + Download</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a note for the recipient..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires">Expiry Date (optional)</Label>
              <Input
                id="expires"
                type="date"
                value={expiresAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
                disabled={isSharing}
              >
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={isSharing || !selectedUserId}>
                {isSharing ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        isLoading={isRevoking}
        variant="destructive"
        title="Revoke access?"
        description={`${selectedShare?.sharedWithUser.name} will no longer be able to access this document.`}
        confirmText="Revoke"
        loadingText="Revoking..."
        onConfirm={handleConfirmRevoke}
      />
    </Card>
  );
}
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose, onGoToProfile }) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Complete your profile</DialogTitle>
        <DialogDescription>
          To access Portfolio and Trade, please add at least a display name (and optionally other details) to your profile.
        </DialogDescription>
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Later</Button>
          <Button onClick={onGoToProfile}>Go to Profile</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { ProfileEditor } from './ProfileEditor';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Update your profile details and upload a profile photo.
        </DialogDescription>
        <div className="mt-4">
          <ProfileEditor onSaved={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

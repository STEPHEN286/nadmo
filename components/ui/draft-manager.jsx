"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { saveDraft, loadDraft, clearDraft, hasDraft, setupAutoSave } from '@/lib/draft-utils';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';

export function DraftManager({ 
  formKey, 
  form, 
  onRestore, 
  onClear, 
  showSaveButton = true,
  showRestoreButton = true,
  enableAutoSave = true,
  className = "" 
}) {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [draftExists, setDraftExists] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    // Check if draft exists on mount
    const draft = loadDraft(formKey);
    setDraftExists(!!draft);
    if (draft) {
      setLastSaved(new Date(draft.timestamp));
    }

    // Setup auto-save if enabled
    if (enableAutoSave && form) {
      const { startAutoSave, stopAutoSave } = setupAutoSave(formKey, form, 10000); // Auto-save every 10 seconds
      autoSaveRef.current = { startAutoSave, stopAutoSave };
      startAutoSave();

      return () => {
        if (autoSaveRef.current) {
          autoSaveRef.current.stopAutoSave();
        }
      };
    }
  }, [formKey, form, enableAutoSave]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (form && form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form]);

  const handleSaveDraft = () => {
    const formData = form.getValues();
    const success = saveDraft(formKey, formData);
    if (success) {
      setDraftExists(true);
      setLastSaved(new Date());
      // Show a brief success indicator
      const button = document.querySelector(`[data-draft-save="${formKey}"]`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Draft Saved!';
        button.disabled = true;
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }
    }
  };

  const handleRestoreDraft = () => {
    const draft = loadDraft(formKey);
    if (draft && onRestore) {
      onRestore(draft.data);
      setShowRestoreDialog(false);
    }
  };

  const handleClearDraft = () => {
    clearDraft(formKey);
    setDraftExists(false);
    setLastSaved(null);
    if (onClear) {
      onClear();
    }
  };

  const formatLastSaved = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showSaveButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          data-draft-save={formKey}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save to Draft
        </Button>
      )}

      {showRestoreButton && draftExists && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowRestoreDialog(true)}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restore Draft
        </Button>
      )}

      {draftExists && lastSaved && (
        <span className="text-xs text-gray-500">
          Last saved: {formatLastSaved(lastSaved)}
        </span>
      )}
      {enableAutoSave && (
        <span className="text-xs text-blue-500">
          Auto-save enabled
        </span>
      )}

      {/* Restore Draft Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Restore Draft
            </DialogTitle>
            <DialogDescription>
              You have unsaved changes from a previous session. Would you like to restore them? 
              This will replace your current form data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearDraft}
            >
              Clear Draft
            </Button>
            <Button
              onClick={handleRestoreDraft}
            >
              Restore Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
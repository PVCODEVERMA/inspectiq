import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LiftFormSection } from './LiftFormSection';
import api, { API_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { Camera, Upload, Trash2, X, Image } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const sectionTags = [
  'General',
  'Machine Room',
  'Hoistway/Shaft',
  'Car & Landing',
  'Safety Devices',
  'Deficiency',
  'Other',
];

export const PhotoUploadSection = ({
  formData,
  onChange,
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('photos', files[i]);
    }

    try {
      const response = await api.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newPhotos = response.data.files.map(file => ({
        id: crypto.randomUUID(),
        url: `${API_BASE_URL}${file.url}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        section: 'General',
        timestamp: new Date().toISOString(),
      }));

      onChange('photos', [...formData.photos, ...newPhotos]);
      toast.success('Photos uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (photoId) => {
    onChange(
      'photos',
      formData.photos.filter((p) => p.id !== photoId)
    );
    toast.success('Photo removed');
  };

  const handleUpdatePhoto = (updatedPhoto) => {
    onChange(
      'photos',
      formData.photos.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p))
    );
    setEditingPhoto(null);
    toast.success('Photo details updated');
  };

  return (
    <LiftFormSection title="Photo Upload" icon={Camera}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Photos'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            type="button"
            variant="secondary"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {formData.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-xl overflow-hidden border border-border"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-32 object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => setEditingPhoto(photo)}
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-2 bg-background">
                  <p className="text-xs font-medium truncate">{photo.title}</p>
                  <p className="text-xs text-muted-foreground">{photo.section}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No photos uploaded yet</p>
          </div>
        )}
      </div>

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Section:</span>{' '}
                  {selectedPhoto.section}
                </div>
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>{' '}
                  {format(new Date(selectedPhoto.timestamp), 'PPpp')}
                </div>
              </div>
              {selectedPhoto.description && (
                <p className="text-sm">{selectedPhoto.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingPhoto.title || ''}
                  onChange={(e) =>
                    setEditingPhoto({ ...editingPhoto, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Section Tag</Label>
                <Select
                  value={editingPhoto.section}
                  onValueChange={(value) =>
                    setEditingPhoto({ ...editingPhoto, section: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingPhoto.description || ''}
                  onChange={(e) =>
                    setEditingPhoto({ ...editingPhoto, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPhoto(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdatePhoto(editingPhoto)}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </LiftFormSection>
  );
};

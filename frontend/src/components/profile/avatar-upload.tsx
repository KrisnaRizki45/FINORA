'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { authApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/types';

interface AvatarUploadProps {
  user: User | null;
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!fileExt || !allowedExts.includes(fileExt.toLowerCase())) {
        toast.error('Only JPG, PNG and WEBP images are allowed');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setIsUploading(true);

      // Unique file name to prevent caching issues if replaced
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save to Laravel Backend
      const response = await authApi.updateProfile({ avatar_url: publicUrl });

      if (response.success) {
        // Optimistic UI / Cache Invalidation
        queryClient.setQueryData(['me'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            user: { ...oldData.user, avatar_url: publicUrl }
          };
        });
        
        // Also update Supabase Auth metadata to keep in sync
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        toast.success('Avatar updated successfully');
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start space-y-4">
      <div className="relative group">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 shadow-md flex items-center justify-center relative">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-gray-500 uppercase">
              {user?.name?.charAt(0) || <UserIcon className="h-10 w-10 text-gray-400" />}
            </span>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden" 
        />
      </div>
      
      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Recommended: Square image, max 5MB (JPG, PNG, WEBP).
        </p>
      </div>
    </div>
  );
}

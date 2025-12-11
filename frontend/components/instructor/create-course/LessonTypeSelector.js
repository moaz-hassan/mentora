"use client";

import { Video, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function LessonTypeSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <Label>Lesson Type</Label>
      <RadioGroup value={value || 'video'} onValueChange={onChange} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="video" id="type-video" />
          <Label
            htmlFor="type-video"
            className="flex items-center gap-2 cursor-pointer font-normal"
          >
            <Video className="w-4 h-4" />
            Video Lesson
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="text" id="type-text" />
          <Label
            htmlFor="type-text"
            className="flex items-center gap-2 cursor-pointer font-normal"
          >
            <FileText className="w-4 h-4" />
            Text Lesson
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

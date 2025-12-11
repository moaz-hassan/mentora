"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import { Label } from '@/components/ui/label';
import 'react-quill/dist/quill.snow.css';


const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link', 'image'
];

export function LessonContentEditor({ value, onChange, label = "Lesson Content" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (content) => {
    
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'strong', 'em', 'u', 's',
        'a', 'img', 'code', 'pre', 'blockquote'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class']
    });
    onChange(sanitized);
  };

  if (!mounted) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="h-64 border border-neutral-300 rounded-md bg-neutral-50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="bg-white rounded-md border border-neutral-300">
        <ReactQuill
          theme="snow"
          value={value || ''}
          onChange={handleChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder="Write your lesson content here..."
          className="h-64"
        />
      </div>
    </div>
  );
}

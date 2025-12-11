import { Input } from "@/components/ui/input";

export default function SocialLinkInput({ 
  platform, 
  label, 
  icon, 
  value, 
  onChange, 
  placeholder 
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
      </label>
      <Input
        type="url"
        value={value || ""}
        onChange={(e) => onChange(platform, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

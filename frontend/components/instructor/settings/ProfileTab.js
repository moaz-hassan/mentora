import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarUpload from "./AvatarUpload";

export default function ProfileTab({
  userData,
  profileData,
  saving,
  onUserChange,
  onProfileChange,
  onAvatarUpload,
  onSave,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload
          avatarUrl={profileData.avatar_url}
          firstName={userData.first_name}
          onUpload={onAvatarUpload}
          disabled={saving}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              First Name
            </label>
            <Input
              type="text"
              value={userData.first_name}
              onChange={(e) => onUserChange("first_name", e.target.value)}
              placeholder="Enter your first name"
            />
            <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
              Displayed on your profile and courses
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
              Last Name
            </label>
            <Input
              type="text"
              value={userData.last_name}
              onChange={(e) => onUserChange("last_name", e.target.value)}
              placeholder="Enter your last name"
            />
            <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">
              Displayed on your profile and courses
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Headline
          </label>
          <Input
            type="text"
            value={profileData.headline}
            onChange={(e) => onProfileChange("headline", e.target.value)}
            placeholder="e.g., Senior Software Engineer | Full-Stack Developer"
            maxLength={255}
          />
          <p className="text-xs text-gray-500 mt-1">
            A brief professional title or tagline (max 255 characters)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About You
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => onProfileChange("bio", e.target.value)}
            rows={5}
            maxLength={5000}
            placeholder="Share your background, expertise, teaching philosophy, and what makes you unique as an instructor..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none placeholder:text-gray-400 dark:placeholder:text-neutral-500"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Tell students about your experience and expertise
            </p>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              {profileData.bio?.length || 0} / 5000
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

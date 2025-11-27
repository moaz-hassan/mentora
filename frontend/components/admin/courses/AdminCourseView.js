import { useState } from "react";
import { 
  Play, FileText, HelpCircle, CheckCircle, XCircle, 
  ChevronDown, ChevronRight, Clock, Download, ExternalLink,
  User, Calendar, BookOpen, AlertTriangle, Video
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminCourseView({ course, onApprove, onReject, onClose }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set(course.Chapters?.map(c => c.id)));

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleLessonSelect = (item) => {
    setActiveLesson(item);
  };

  // Helper to get all items (lessons + quizzes) sorted
  const getChapterItems = (chapter) => {
    const lessons = (chapter.Lessons || []).map(l => ({ ...l, type: 'lesson', itemType: l.lesson_type || 'video' }));
    const quizzes = (chapter.Quizzes || []).map(q => ({ ...q, type: 'quiz', itemType: 'quiz' }));
    return [...lessons, ...quizzes].sort((a, b) => a.order_number - b.order_number);
  };

  const renderContentPreview = () => {
    if (!activeLesson) {
      return (
        <div className="space-y-6">
          {/* Intro Video */}
          <Card>
            <CardHeader>
              <CardTitle>Course Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              {course.intro_video_url ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    src={course.intro_video_url} 
                    controls 
                    className="w-full h-full"
                    poster={course.thumbnail_url}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <Video className="w-12 h-12" />
                  <span className="ml-2">No Intro Video</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
            </CardContent>
          </Card>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {course.requirements?.split('\n').map((req, i) => (
                    <li key={i}>{req}</li>
                  )) || <li className="text-gray-400">None specified</li>}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Target Audience</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {course.target_audience?.split('\n').map((aud, i) => (
                    <li key={i}>{aud}</li>
                  )) || <li className="text-gray-400">None specified</li>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Render active lesson/quiz content
    return (
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2 uppercase">
                {activeLesson.type === 'quiz' ? 'Quiz' : activeLesson.lesson_type}
              </Badge>
              <CardTitle>{activeLesson.title}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveLesson(null)}>
              Close Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {activeLesson.type === 'lesson' && activeLesson.lesson_type === 'video' && (
            <div className="space-y-4">
              {activeLesson.video_url ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    src={activeLesson.video_url} 
                    controls 
                    className="w-full h-full"
                    autoPlay
                  />
                </div>
              ) : (
                <div className="p-8 bg-gray-100 rounded-lg text-center text-gray-500">
                  Video processing or not available
                </div>
              )}
              <div className="text-sm text-gray-500">
                Duration: {Math.round(activeLesson.duration / 60)} mins
              </div>
            </div>
          )}

          {activeLesson.type === 'lesson' && activeLesson.lesson_type === 'text' && (
            <div className="prose max-w-none p-4 bg-gray-50 rounded-lg">
              <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            </div>
          )}

          {activeLesson.type === 'quiz' && (
            <div className="space-y-6">
              {activeLesson.questions?.map((q, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="font-medium mb-3 flex gap-2">
                    <span className="text-gray-500">{idx + 1}.</span>
                    {q.question}
                  </div>
                  <div className="space-y-2 pl-6">
                    {q.options?.map((opt, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={`flex items-center gap-2 text-sm p-2 rounded ${
                          optIdx === q.correct_answer 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "text-gray-600"
                        }`}
                      >
                        {optIdx === q.correct_answer ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attachments for lessons */}
          {activeLesson.type === 'lesson' && activeLesson.attachments?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeLesson.attachments.map((att, idx) => (
                  <a 
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700 truncate flex-1">{att.name}</span>
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="gap-2">
            <ChevronDown className="w-4 h-4 rotate-90" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3" />
              {course.Instructor?.first_name} {course.Instructor?.last_name}
              <span>•</span>
              <Badge variant="secondary" className="text-[10px] h-5">
                {course.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => onApprove(course)} 
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </Button>
          <Button 
            onClick={() => onReject(course)} 
            variant="destructive"
            className="gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Curriculum */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="max-h-[calc(100vh-140px)] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {course.Chapters?.sort((a,b) => a.order_number - b.order_number).map((chapter, idx) => (
                  <div key={chapter.id} className="border-b last:border-0">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="font-medium text-sm text-gray-900">
                        Chapter {idx + 1}: {chapter.title}
                      </span>
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedChapters.has(chapter.id) && (
                      <div className="bg-gray-50/50">
                        {getChapterItems(chapter).map((item, itemIdx) => (
                          <button
                            key={item.id}
                            onClick={() => handleLessonSelect(item)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm border-l-2 transition-colors text-left ${
                              activeLesson?.id === item.id
                                ? "bg-blue-50 border-blue-600 text-blue-700"
                                : "border-transparent hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.type === 'quiz' ? (
                              <HelpCircle className="w-4 h-4 flex-shrink-0" />
                            ) : item.lesson_type === 'video' ? (
                              <Play className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="truncate">{item.title}</span>
                            {item.type === 'lesson' && item.lesson_type === 'video' && (
                              <span className="ml-auto text-xs text-gray-400">
                                {Math.round(item.duration / 60)}m
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Analysis Card (Small version for quick reference) */}
            {course.ai_analysis && (
              <Card className="bg-purple-50 border-purple-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-900 text-base flex items-center gap-2">
                      <div className="p-1 bg-purple-100 rounded">
                        <Video className="w-3 h-3 text-purple-600" />
                      </div>
                      AI Insight
                    </CardTitle>
                    <Badge variant={course.ai_analysis.suggested_decision === 'approve' ? 'success' : 'destructive'}>
                      {course.ai_analysis.suggested_decision}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-purple-800 line-clamp-3 mb-2">
                    {course.ai_analysis.summary}
                  </p>
                  <Button 
                    variant="link" 
                    className="text-purple-700 p-0 h-auto text-xs"
                    onClick={() => setActiveLesson(null)} // Go to overview to see full analysis if we add it there
                  >
                    View Full Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {renderContentPreview()}
            
            {/* Full AI Analysis (Only shown on Overview) */}
            {!activeLesson && course.ai_analysis && (
               <div className="p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 shadow-sm mt-6">
                 {/* ... Reuse the AI analysis UI from page.js ... */}
                 {/* For brevity, I'll just show the summary and reasoning here nicely */}
                 <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                   <Video className="w-5 h-5" />
                   Full AI Analysis
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <h4 className="text-xs font-bold text-green-800 uppercase mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {course.ai_analysis.strengths?.map((s, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <h4 className="text-xs font-bold text-red-800 uppercase mb-2">Weaknesses</h4>
                      <ul className="space-y-1">
                        {course.ai_analysis.weaknesses?.map((w, i) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2">
                            <AlertTriangle className="w-3 h-3 text-red-600 mt-1 flex-shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>
                 
                 <div className="bg-white p-4 rounded-lg border border-purple-100">
                   <h4 className="text-sm font-semibold text-purple-900 mb-2">Final Reasoning</h4>
                   <p className="text-sm text-gray-700">{course.ai_analysis.reasoning}</p>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

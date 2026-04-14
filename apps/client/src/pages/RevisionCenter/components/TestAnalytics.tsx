import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  BookOpen,
  Brain,
  ChevronRight
} from 'lucide-react';
import { Book } from '@/redux/slices/bookSlice';

interface TestAnalyticsProps {
  books: Book[];
}

interface TestResult {
  id: string;
  testName: string;
  chapterName: string;
  bookTitle: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  date: Date;
  notes?: string;
}

const TestAnalytics = ({ books }: TestAnalyticsProps) => {
  // Aggregate all test results
  const allTests: TestResult[] = useMemo(() => {
    const tests: TestResult[] = [];

    books.forEach(book => {
      book.chapters?.forEach((chapter, chapterIndex) => {
        chapter.tests?.forEach((test, testIndex) => {
          tests.push({
            id: `${book.id}-${chapterIndex}-test-${testIndex}`,
            testName: test.testName,
            chapterName: chapter.name,
            bookTitle: book.title,
            subject: book.subject,
            score: test.score,
            totalMarks: test.totalMarks,
            percentage: Math.round((test.score / test.totalMarks) * 100),
            date: new Date(test.testDate || Date.now()),
            notes: test.notes
          });
        });
      });
    });

    // Sort by date (newest first)
    return tests.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [books]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (allTests.length === 0) return null;

    const totalScore = allTests.reduce((sum, test) => sum + test.percentage, 0);
    const averageScore = Math.round(totalScore / allTests.length);
    
    const highestScore = Math.max(...allTests.map(t => t.percentage));
    const lowestScore = Math.min(...allTests.map(t => t.percentage));
    
    const excellentTests = allTests.filter(t => t.percentage >= 80).length;
    const goodTests = allTests.filter(t => t.percentage >= 60 && t.percentage < 80).length;
    const poorTests = allTests.filter(t => t.percentage < 60).length;

    // Group by subject
    const subjectStats: { [key: string]: { total: number; count: number; tests: TestResult[] } } = {};
    allTests.forEach(test => {
      if (!subjectStats[test.subject]) {
        subjectStats[test.subject] = { total: 0, count: 0, tests: [] };
      }
      subjectStats[test.subject].total += test.percentage;
      subjectStats[test.subject].count += 1;
      subjectStats[test.subject].tests.push(test);
    });

    const subjectAverages = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      average: Math.round(data.total / data.count),
      count: data.count,
      tests: data.tests
    })).sort((a, b) => b.average - a.average);

    return {
      averageScore,
      highestScore,
      lowestScore,
      totalTests: allTests.length,
      excellentTests,
      goodTests,
      poorTests,
      subjectAverages
    };
  }, [allTests]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (allTests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tests taken yet</h3>
          <p className="text-muted-foreground max-w-md">
            Start taking tests to track your performance. Go to your books and add test results!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <h3 className="text-3xl font-bold mt-1">{stats?.averageScore}%</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={stats?.averageScore} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                <h3 className="text-3xl font-bold mt-1 text-green-600">{stats?.highestScore}%</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                <h3 className="text-3xl font-bold mt-1 text-red-600">{stats?.lowestScore}%</h3>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <h3 className="text-3xl font-bold mt-1">{stats?.totalTests}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">Excellent (80-100%)</span>
                <span className="font-medium">{stats?.excellentTests} tests</span>
              </div>
              <Progress 
                value={stats ? (stats.excellentTests / stats.totalTests) * 100 : 0} 
                className="h-2 bg-green-100"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600 font-medium">Good (60-79%)</span>
                <span className="font-medium">{stats?.goodTests} tests</span>
              </div>
              <Progress 
                value={stats ? (stats.goodTests / stats.totalTests) * 100 : 0} 
                className="h-2 bg-yellow-100"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-red-600 font-medium">Needs Improvement (&lt;60%)</span>
                <span className="font-medium">{stats?.poorTests} tests</span>
              </div>
              <Progress 
                value={stats ? (stats.poorTests / stats.totalTests) * 100 : 0} 
                className="h-2 bg-red-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      {stats && stats.subjectAverages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Performance by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subjectAverages.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.subject}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getScoreColor(subject.average)}>
                        {subject.average}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({subject.count} tests)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={subject.average} 
                    className={`h-2 ${
                      subject.average >= 80 ? 'bg-green-100' : 
                      subject.average >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Tests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {allTests.slice(0, 20).map((test) => (
                <div 
                  key={test.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{test.testName}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">
                        {test.chapterName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{test.bookTitle}</span>
                      <span>•</span>
                      <span>{test.subject}</span>
                      <span>•</span>
                      <span>{test.date.toLocaleDateString()}</span>
                    </div>
                    {test.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{test.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge 
                      variant="outline" 
                      className={`${getScoreColor(test.percentage)} whitespace-nowrap`}
                    >
                      {test.score}/{test.totalMarks}
                    </Badge>
                    <span className={`text-lg font-bold whitespace-nowrap ${
                      test.percentage >= 80 ? 'text-green-600' : 
                      test.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {test.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAnalytics;
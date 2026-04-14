import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const GenerateTest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        topic: '',
        subject: '',
        count: 5,
        difficulty: 'medium'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value: string) => {
        setFormData({ ...formData, difficulty: value });
    };

    const handleSliderChange = (value: number[]) => {
        setFormData({ ...formData, count: value[0] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const res = await axios.post('/ai/tests/generate', formData, config);

            if (res.data.success) {
                navigate(`/tests/${res.data.data._id}`);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] w-full p-4">
            <Card className="w-full max-w-2xl shadow-lg border-2">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">AI Test Generator</CardTitle>
                            <CardDescription className="text-base mt-2">
                                Describe what you want to study, and our AI will create a custom exam for you instantly.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic / Concept</Label>
                            <Input
                                id="topic"
                                name="topic"
                                value={formData.topic}
                                onChange={handleChange}
                                placeholder="e.g. React Hooks, Newton's Laws, French Revolution"
                                required
                                className="h-12 text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g. Computer Science, Physics, History"
                                required
                                className="h-12 text-lg"
                            />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                                <Label>Number of Questions</Label>
                                <span className="font-bold text-lg bg-secondary px-3 py-1 rounded-md">
                                    {formData.count}
                                </span>
                            </div>
                            <Slider
                                value={[formData.count]}
                                onValueChange={handleSliderChange}
                                min={1}
                                max={10}
                                step={1}
                                className="py-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={handleSelectChange}
                            >
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-14 text-lg font-bold mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-xl"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Generate Test
                                </div>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default GenerateTest;

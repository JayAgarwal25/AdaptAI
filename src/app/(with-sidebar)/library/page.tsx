'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const uploadsData = [
	{ title: 'Physics Notes', type: 'PDF', language: 'English', date: '2025-09-10' },
	{ title: 'Maths Worksheet', type: 'DOCX', language: 'Hindi', date: '2025-09-12' },
	{ title: 'Biology Slides', type: 'PPT', language: 'English', date: '2025-09-14' },
];

const resourcesData = [
	{ title: 'NCERT Physics Class 11', subject: 'Physics', type: 'PDF' },
	{ title: 'NCERT Maths Class 10', subject: 'Maths', type: 'PDF' },
	{ title: 'Past Year CBSE Chemistry Paper', subject: 'Chemistry', type: 'PDF' },
];

const discoverData = [
	{
		title: 'NCERT Biology Class 12',
		description: 'Recommended for you since you uploaded Biology content.',
		type: 'Textbook',
		subject: 'Biology',
		action: 'View',
	},
	{
		title: 'Sample Quiz Templates',
		description: 'Create engaging quizzes with these ready-to-use templates.',
		type: 'Template',
		subject: 'General',
		action: 'Use Template',
	},
	{
		title: 'CBSE Physics Past Papers',
		description: 'Practice with real exam questions from previous years.',
		type: 'Past Paper',
		subject: 'Physics',
		action: 'Practice',
	},
	{
		title: 'NCERT Chemistry Class 11',
		description: 'Explore curated Chemistry resources for deeper learning.',
		type: 'Textbook',
		subject: 'Chemistry',
		action: 'View',
	},
	{
		title: 'Adaptive Learning Path',
		description: 'Personalized recommendations based on your uploads.',
		type: 'Feature',
		subject: 'All Subjects',
		action: 'Explore',
	},
];

export default function LibraryPage() {
	const [tab, setTab] = useState('uploads');
	const discoverBubbleRef = useRef<HTMLSpanElement>(null);
	// Optional: Focus animation on mount
	useEffect(() => {
		if (tab === 'uploads' && discoverBubbleRef.current) {
			discoverBubbleRef.current.classList.add('animate-bounce');
		}
	}, [tab]);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Library</h1>
			<Tabs value={tab} onValueChange={setTab}>
				<TabsList className="mb-6 relative">
					<TabsTrigger value="uploads">My Uploads</TabsTrigger>
					<TabsTrigger value="resources">Resources</TabsTrigger>
					<div className="relative inline-block">
						<TabsTrigger value="discover">Discover</TabsTrigger>
						{/* Floating bubble */}
						{tab !== 'discover' && (
							<span
								ref={discoverBubbleRef}
								className="absolute -top-3 -right-6 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg cursor-pointer animate-bounce z-10"
								style={{ pointerEvents: 'auto' }}
								tabIndex={0}
								onMouseEnter={e => {
									const tooltip = e.currentTarget.querySelector('.discover-tooltip');
									if (tooltip) tooltip.classList.remove('opacity-0');
									if (tooltip) tooltip.classList.add('opacity-100');
								}}
								onMouseLeave={e => {
									const tooltip = e.currentTarget.querySelector('.discover-tooltip');
									if (tooltip) tooltip.classList.remove('opacity-100');
									if (tooltip) tooltip.classList.add('opacity-0');
								}}
								onFocus={e => {
									const tooltip = e.currentTarget.querySelector('.discover-tooltip');
									if (tooltip) tooltip.classList.remove('opacity-0');
									if (tooltip) tooltip.classList.add('opacity-100');
								}}
								onBlur={e => {
									const tooltip = e.currentTarget.querySelector('.discover-tooltip');
									if (tooltip) tooltip.classList.remove('opacity-100');
									if (tooltip) tooltip.classList.add('opacity-0');
								}}
							>
								?
								<span className="discover-tooltip absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white text-gray-700 text-xs rounded shadow-lg px-3 py-2 opacity-0 transition-opacity duration-200 pointer-events-none" style={{ top: '100%' }}>
									Discover recommended content tailored for you!
								</span>
							</span>
						)}
					</div>
				</TabsList>

				{/* My Uploads Tab */}
				<TabsContent value="uploads">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-lg font-semibold">My Uploads</h2>
						<Button size="sm" className="font-semibold">+ Upload New File</Button>
					</div>
					<Card>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Language</TableHead>
										<TableHead>Date Uploaded</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{uploadsData.map((item, idx) => (
										<TableRow key={idx}>
											<TableCell>{item.title}</TableCell>
											<TableCell>{item.type}</TableCell>
											<TableCell>{item.language}</TableCell>
											<TableCell>{item.date}</TableCell>
											<TableCell>
												<Button size="sm" variant="outline" className="mr-2">Adapt</Button>
												<Button size="sm" variant="destructive">Delete</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Resources Tab */}
				<TabsContent value="resources">
					<h2 className="text-lg font-semibold mb-4">Curated Resources</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{resourcesData.map((res, idx) => (
							<Card key={idx}>
								<CardHeader>
									<CardTitle>{res.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="mb-2 text-sm text-muted-foreground">
										<span className="font-medium">Subject:</span> {res.subject}
									</div>
									<div className="mb-4 text-sm text-muted-foreground">
										<span className="font-medium">Type:</span> {res.type}
									</div>
									<Button size="sm" className="font-semibold">Adapt</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				{/* Discover Tab */}
				<TabsContent value="discover">
					<h2 className="text-lg font-semibold mb-4">Discover</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{discoverData.map((item, idx) => (
							<Card key={idx}>
								<CardHeader>
									<CardTitle>{item.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="mb-2 text-sm text-muted-foreground">
										<span className="font-medium">{item.type}:</span> {item.subject}
									</div>
									<div className="mb-4 text-sm text-muted-foreground">{item.description}</div>
									<Button size="sm" className="font-semibold">{item.action}</Button>
								</CardContent>
							</Card>
						))}
					</div>
					<div className="mt-6 text-xs text-muted-foreground text-center">
						This is mock/demo content. Recommendations will improve as you use the platform.
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

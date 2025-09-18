'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { Button } from '@/components/ui/button';

const kpiStats = [
	{ label: 'Total Content', value: 128 },
	{ label: 'Quizzes Generated', value: 42 },
	{ label: 'Video Lectures Shared', value: 15 },
	{ label: 'Shares', value: 87 },
	{ label: 'Learners Reached', value: 3120 },
];

const videoSocialStats = [
	{
		title: 'Photosynthesis Explained',
		platforms: {
			YouTube: { views: 1200, likes: 110, comments: 12, shares: 30 },
			Facebook: { views: 800, likes: 60, comments: 8, shares: 18 },
			Instagram: { views: 500, likes: 45, comments: 5, shares: 10 },
		},
	},
	{
		title: 'Gravity Lecture',
		platforms: {
			YouTube: { views: 950, likes: 90, comments: 9, shares: 22 },
			Facebook: { views: 600, likes: 40, comments: 6, shares: 12 },
			Instagram: { views: 350, likes: 30, comments: 2, shares: 5 },
		},
	},
	{
		title: 'Algebra Deep Dive',
		platforms: {
			YouTube: { views: 800, likes: 70, comments: 7, shares: 15 },
			Facebook: { views: 500, likes: 35, comments: 4, shares: 8 },
			Instagram: { views: 300, likes: 25, comments: 3, shares: 4 },
		},
	},
	{
		title: 'Cell Division Animation',
		platforms: {
			YouTube: { views: 1100, likes: 120, comments: 14, shares: 28 },
			Facebook: { views: 700, likes: 55, comments: 9, shares: 16 },
			Instagram: { views: 400, likes: 38, comments: 6, shares: 9 },
		},
	},
	{
		title: 'Newton’s Laws',
		platforms: {
			YouTube: { views: 670, likes: 60, comments: 5, shares: 10 },
			Facebook: { views: 420, likes: 28, comments: 3, shares: 6 },
			Instagram: { views: 250, likes: 18, comments: 2, shares: 2 },
		},
	},
	{
		title: 'Organic Chemistry Basics',
		platforms: {
			YouTube: { views: 900, likes: 80, comments: 10, shares: 20 },
			Facebook: { views: 600, likes: 42, comments: 5, shares: 11 },
			Instagram: { views: 320, likes: 22, comments: 2, shares: 5 },
		},
	},
	{
		title: 'World War II Overview',
		platforms: {
			YouTube: { views: 1050, likes: 95, comments: 11, shares: 25 },
			Facebook: { views: 750, likes: 50, comments: 7, shares: 14 },
			Instagram: { views: 410, likes: 30, comments: 4, shares: 7 },
		},
	},
	{
		title: 'Trigonometry Crash Course',
		platforms: {
			YouTube: { views: 780, likes: 65, comments: 6, shares: 13 },
			Facebook: { views: 500, likes: 33, comments: 4, shares: 9 },
			Instagram: { views: 270, likes: 19, comments: 2, shares: 3 },
		},
	},
];

const contentData = [
	{ title: 'Photosynthesis Explained', type: 'Lecture', language: 'English', date: '2025-09-18', status: 'Published' },
	{ title: 'Cell Division Quiz', type: 'Quiz', language: 'English', date: '2025-09-17', status: 'Draft' },
	{ title: 'Gravity Notes', type: 'Notes', language: 'Hindi', date: '2025-09-15', status: 'Published' },
	{ title: 'Algebra Summary', type: 'Summary', language: 'English', date: '2025-09-10', status: 'Published' },
];

const pieData = [
	{ name: 'Lecture', value: 48 },
	{ name: 'Quiz', value: 32 },
	{ name: 'Notes', value: 28 },
	{ name: 'Summary', value: 20 },
];
const pieColors = ['#6366f1', '#22d3ee', '#f59e42', '#10b981'];

const lineData = [
	{ date: 'Sep 1', engagement: 120 },
	{ date: 'Sep 5', engagement: 180 },
	{ date: 'Sep 10', engagement: 140 },
	{ date: 'Sep 15', engagement: 200 },
	{ date: 'Sep 18', engagement: 170 },
];

const barData = [
	{ quiz: 'Cell Division', avgScore: 78 },
	{ quiz: 'Gravity', avgScore: 85 },
	{ quiz: 'Algebra', avgScore: 92 },
	{ quiz: 'Photosynthesis', avgScore: 88 },
];

export default function DashboardPage() {
	const maxInitialVideos = 6;
	const [showAllVideos, setShowAllVideos] = useState(false);
	const visibleVideos = showAllVideos ? videoSocialStats : videoSocialStats.slice(0, maxInitialVideos);

	return (
		<div className="p-6 space-y-8">

					{/* Top: KPI Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
						{kpiStats.map((stat) => (
							<Card key={stat.label}>
								<CardHeader>
									<CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stat.value}</div>
								</CardContent>
							</Card>
						))}
					</div>

			{/* Middle: Content Table (kept above videos for accessibility) */}
			<Card>
				<CardHeader>
					<CardTitle>Educator Content</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Language</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contentData.map((item, idx) => (
								<TableRow key={idx}>
									<TableCell>{item.title}</TableCell>
									<TableCell>{item.type}</TableCell>
									<TableCell>{item.language}</TableCell>
									<TableCell>{item.date}</TableCell>
									<TableCell>{item.status}</TableCell>
									<TableCell>
										<Button size="sm" variant="outline" className="mr-2">
											View
										</Button>
										<Button size="sm" variant="outline" className="mr-2">
											Share
										</Button>
										<Button size="sm" variant="outline">
											Export
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Video Analytics Panel as Expandable Cards with Hover Stats */}
			<Card>
				<CardHeader>
					<CardTitle>Video Lectures - Social Media Analytics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{visibleVideos.map((video, idx) => (
							<Popover key={video.title}>
								<PopoverTrigger asChild>
									<Card className="cursor-pointer hover:shadow-lg transition-shadow">
										<CardHeader>
											<CardTitle>{video.title}</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-sm text-muted-foreground">Click to see social stats</div>
										</CardContent>
									</Card>
								</PopoverTrigger>
								<PopoverContent className="w-64 p-4">
									<div className="font-semibold mb-2">Social Media Stats</div>
									{Object.entries(video.platforms).map(([platform, stats]) => (
										<div key={platform} className="mb-3">
											<div className="font-bold text-sm mb-1">{platform}</div>
											<div className="grid grid-cols-2 gap-2 text-xs">
												<div>Views: <span className="font-medium">{stats.views}</span></div>
												<div>Likes: <span className="font-medium">{stats.likes}</span></div>
												<div>Comments: <span className="font-medium">{stats.comments}</span></div>
												<div>Shares: <span className="font-medium">{stats.shares}</span></div>
											</div>
										</div>
									))}
								</PopoverContent>
							</Popover>
						))}
					</div>
					{videoSocialStats.length > maxInitialVideos && (
						<div className="flex justify-center mt-4">
							<Button variant="outline" onClick={() => setShowAllVideos(v => !v)}>
								{showAllVideos ? 'Show Less' : 'See More'}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Bottom: Analytics */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Content by Type</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={220}>
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={60}
									label
								>
									{pieData.map((entry, idx) => (
										<Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Engagement Over Time</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={220}>
							<LineChart data={lineData}>
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="engagement"
									stroke="#6366f1"
									strokeWidth={2}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Quiz Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={220}>
							<BarChart data={barData}>
								<XAxis dataKey="quiz" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="avgScore" fill="#22d3ee" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Actions */}
			<div className="flex justify-end">
				<Button size="lg" className="font-semibold">
					+ Create New Adaptation
				</Button>
			</div>
		</div>
	);
}

import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { subDays, format } from 'date-fns'

export async function getDashboardStats(req: Request, res: Response) {
    try {
        const [totalPosts, totalAffiliates, totalClicks] = await Promise.all([
            prisma.post.count(),
            prisma.affiliate.count(),
            prisma.clickLog.count(),
        ])

        // Mock revenue: 1 click = 1000 VND (just for demo)
        const totalRevenue = totalClicks * 1000;

        // Chart Data: Last 7 days
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return {
                date: d,
                label: format(d, 'dd/MM'),
                clicks: 0,
                revenue: 0 // Mock
            };
        });

        // Get clicks for last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        const recentClicks = await prisma.clickLog.findMany({
            where: {
                clickedAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Aggregate
        recentClicks.forEach(click => {
            const dateStr = format(click.clickedAt, 'dd/MM');
            const day = days.find(d => d.label === dateStr);
            if (day) {
                day.clicks += 1;
                day.revenue += 1000; // Mock revenue per click
            }
        });

        res.json({
            summary: {
                revenue: totalRevenue,
                clicks: totalClicks,
                posts: totalPosts,
                affiliates: totalAffiliates
            },
            chart: days.map(d => ({ name: d.label, revenue: d.revenue, clicks: d.clicks }))
        })

    } catch (error) {
        console.error("Dashboard Stats Error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

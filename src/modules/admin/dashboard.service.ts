import { prisma } from '../../config/prisma'
import { subDays, format } from 'date-fns'

export class DashboardService {
    static async getStats() {
        const [totalPosts, totalAffiliates, totalClicks] = await Promise.all([
            prisma.post.count(),
            prisma.affiliate.count(),
            prisma.clickLog.count(),
        ])

        // Mock revenue: 1 click = 1000 VND (should be moved to config or calculated from real data later)
        const REVENUE_PER_CLICK = 1000;
        const totalRevenue = totalClicks * REVENUE_PER_CLICK;

        // Chart Data: Last 7 days
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return {
                date: d,
                label: format(d, 'dd/MM'),
                clicks: 0,
                revenue: 0
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
                day.revenue += REVENUE_PER_CLICK;
            }
        });

        return {
            summary: {
                revenue: totalRevenue,
                clicks: totalClicks,
                posts: totalPosts,
                affiliates: totalAffiliates
            },
            chart: days.map(d => ({ name: d.label, revenue: d.revenue, clicks: d.clicks }))
        }
    }
}

import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { sendEmail } from '../../services/email.service';
import { z } from 'zod';

export async function subscribeToNewsletter(req: Request, res: Response) {
    try {
        const schema = z.object({
            email: z.string().email(),
        });

        const { email } = schema.parse(req.body);

        // Check if already subscribed (optional, assume we just acknowledge)
        // Store in DB if you have a Subscriber model (not currently in schema from what we saw, but we can add or just send email for now)
        // For now, let's just send a welcome email and simulate success.

        const success = await sendEmail(
            email,
            'Chào mừng bạn đến với Bản tin Nội thất!',
            '<h1>Cảm ơn bạn đã đăng ký!</h1><p>Chúng tôi sẽ gửi cho bạn những bài viết mới nhất hàng tuần.</p>'
        );

        if (!success) {
            return res.status(500).json({ message: 'Lỗi gửi email xác nhận.' });
        }

        res.json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email.' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Email không hợp lệ.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra.' });
    }
}


import { PrismaClient } from '@prisma/client';
import { slugify } from '../utils/slugify';

const prisma = new PrismaClient();

const FURNITURE_POSTS = [
    {
        title: "Top 5 Mẫu Sofa Da Bò Ý Đẳng Cấp Cho Phòng Khách Hiện Đại 2024",
        topic: "Sofa & Salon",
        excerpt: "Khám phá những mẫu sofa da bò Ý nhập khẩu sang trọng, bền bỉ và đẳng cấp nhất cho không gian phòng khách hiện đại của bạn.",
        thumbnail: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>1. Sofa Da Bò Ý - Biểu Tượng Của Sự Sang Trọng</h2>
            <p>Sofa da bò Ý từ lâu đã được xem là chuẩn mực của nội thất cao cấp. Với chất lượng da thượng hạng, độ bền vượt trội theo thòi gian và thiết kế tinh tế, đây là lựa chọn hàng đầu cho các biệt thự và căn hộ cao cấp.</p>
            
            <h2>2. Tại Sao Nên Chọn Sofa Da Bò Ý?</h2>
            <ul>
                <li><strong>Độ bền vô đối:</strong> Càng dùng càng bóng đẹp.</li>
                <li><strong>Thoáng khí:</strong> Không bị bí bách như da công nghiệp.</li>
                <li><strong>Thẩm mỹ:</strong> Vân da tự nhiên, độc bản.</li>
            </ul>

            <h2>3. Top 5 Mẫu Hot Nhất 2024</h2>
            <p>Dưới đây là danh sách các mẫu sofa da bò bán chạy nhất...</p>
            <h3>Mẫu Sofa Văng Hiện Đại</h3>
            <p>Phù hợp cho phòng khách chung cư...</p>
            <h3>Mẫu Sofa Góc Chữ L</h3>
            <p>Tối ưu không gian cho gia đình đông người...</p>
        `
    },
    {
        title: "Bàn Trà Thông Minh: Giải Pháp Tiết Kiệm Diện Tích Cho Căn Hộ Nhỏ",
        topic: "Bàn trà",
        excerpt: "Bàn trà thông minh tích hợp ngăn kéo, nâng hạ độ cao đang là xu hướng nội thất cho căn hộ chung cư diện tích nhỏ.",
        thumbnail: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Xu Hướng Bàn Trà Thông Minh</h2>
            <p>Không gian sống ngày càng thu hẹp khiến nhu cầu về nội thất đa năng tăng cao.</p>
            <h2>Tính Năng Nổi Bật</h2>
            <p>Bàn trà kết hợp bàn làm việc, bàn trà kết hợp bàn ăn...</p>
        `
    },
    {
        title: "Review Ghế Công Thái Học Herman Miller Aeron: Có Đáng Tiền?",
        topic: "Ghế công thái học",
        excerpt: "Đánh giá chi tiết 'vua' của các loại ghế công thái học - Herman Miller Aeron. Liệu mức giá hàng chục triệu có xứng đáng?",
        thumbnail: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Huyền Thoại Ghế Công Thái Học</h2>
            <p>Herman Miller Aeron không chỉ là một chiếc ghế, nó là một biểu tượng văn hóa văn phòng.</p>
            <h2>Cảm Giác Ngồi</h2>
            <p>Lưới Pellicle độc quyền mang lại sự thoáng khí tuyệt đối...</p>
        `
    },
    {
        title: "Cách Chọn Đèn Trang Trí Phòng Ngủ Ấm Áp Và Lãng Mạn",
        topic: "Đèn trang trí",
        excerpt: "Ánh sáng là linh hồn của phòng ngủ. Hướng dẫn chọn đèn ngủ đúng cách để có giấc ngủ ngon và không gian lãng mạn.",
        thumbnail: "https://images.unsplash.com/photo-1513506003011-3b03c8a35918?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Nguyên Tắc Ánh Sáng Phòng Ngủ</h2>
            <p>Nên chọn ánh sáng vàng ấm (2700K-3000K)...</p>
        `
    },
    {
        title: "Setup Góc Gaming Cực Chất Với Bàn Nâng Hạ",
        topic: "Bàn nâng hạ",
        excerpt: "Biến góc chơi game trở nên chuyên nghiệp và bảo vệ sức khỏe cột sống với bàn nâng hạ chiều cao tự động.",
        thumbnail: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Lợi Ích Của Bàn Nâng Hạ Với Gamer</h2>
            <p>Ngồi lâu cày game rất hại lưng. Đứng chơi game giúp tuần hoàn máu tốt hơn...</p>
        `
    },
    {
        title: "Kệ Tivi Treo Tường: Xu Hướng Minimalism 2025",
        topic: "Kệ Tivi",
        excerpt: "Đơn giản nhưng tinh tế. Kệ tivi treo tường giúp phòng khách rộng rãi hơn và dễ dàng vệ sinh sàn nhà.",
        thumbnail: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Ưu Điểm Của Kệ Treo Tường</h2>
            <p>Tiết kiệm diện tích sàn, tạo cảm giác không gian mở...</p>
        `
    },
    {
        title: "Robot Hút Bụi Lau Nhà Tốt Nhất Tầm Giá 10 Triệu",
        topic: "Robot hút bụi",
        excerpt: "So sánh Ecovacs, Roborock và Xiaomi. Đâu là trợ thủ đắc lực nhất cho người bận rộn trong tầm giá 10 triệu đồng?",
        thumbnail: "https://images.unsplash.com/photo-1569605803663-093c341038c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Tiêu Chí Chọn Robot Hút Bụi</h2>
            <p>Lực hút, công nghệ lau rung, khả năng tránh vật cản...</p>
        `
    },
    {
        title: "Trồng Cây Cảnh Ban Công: 5 Loại Cây Dễ Sống, Ít Chăm Sóc",
        topic: "Cây cảnh",
        excerpt: "Biến ban công thành khu vườn nhỏ xanh mát với top 5 loại cây chịu nắng tốt, phù hợp cho người bận rộn.",
        thumbnail: "https://images.unsplash.com/photo-1463320726281-696a485928c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Cây Lưỡi Hổ</h2>
            <p>Vua của các loại cây chịu khắc nghiệt...</p>
        `
    },
    {
        title: "Loa Thông Minh Nào Tốt? Google Nest, Apple HomePod Hay Amazon Echo?",
        topic: "Loa thông minh",
        excerpt: "So sánh 3 hệ sinh thái nhà thông minh phổ biến nhất hiện nay để giúp bạn chọn loa thông minh phù hợp.",
        thumbnail: "https://images.unsplash.com/photo-1543512214-318c77a07293?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Hệ Sinh Thái Google Home</h2>
            <p>Google Assistant thông minh nhất, hỗ trợ tiếng Việt tốt nhất...</p>
        `
    },
    {
        title: "Thiết Kế Sân Vườn Nhỏ Đẹp Cho Nhà Phố",
        topic: "Sân vườn & Ban công",
        excerpt: "Những ý tưởng thiết kế tiểu cảnh sân vườn cực chill cho nhà phố diện tích hẹp.",
        thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
        content: `
            <h2>Tận Dụng Góc Chết</h2>
            <p>Gầm cầu thang, giếng trời đều có thể biến thành mảng xanh...</p>
        `
    }
];

async function main() {
    console.log("🌱 Seeding Furniture Content...");

    // 1. Get User ID (Assuming ID 1 exists, usually Admin)
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found to assign posts!");
        return;
    }

    // 2. Loop and Create
    for (const post of FURNITURE_POSTS) {
        // Find topic by name (insensitive search logic roughly)
        // Or just findFirst where name contains...
        const topic = await prisma.topic.findFirst({
            where: { name: { contains: post.topic } } // Naive match
        });

        if (!topic) {
            console.warn(`Skipping "${post.title}": Topic "${post.topic}" not found.`);
            continue;
        }

        const slug = slugify(post.title);

        // Upsert to avoid duplicates
        await prisma.post.upsert({
            where: { slug },
            update: {},
            create: {
                title: post.title,
                slug,
                excerpt: post.excerpt,
                content: post.content, // Should be longer for real SEO
                thumbnail: post.thumbnail,
                status: 'PUBLISHED',
                publishedAt: new Date(),
                authorId: user.id,
                topicId: topic.id,
                views: Math.floor(Math.random() * 1000)
            }
        });
        console.log(`✅ Created: ${post.title}`);
    }

    console.log("Done seeding!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

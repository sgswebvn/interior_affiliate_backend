import { PrismaClient } from '@prisma/client';
import { slugify } from '../utils/slugify';

const prisma = new PrismaClient();

// Data Helpers
const images = [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&q=80",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
    "https://images.unsplash.com/photo-1616137466211-f939a420be63?w=800&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80"
];

function getRandomImage() {
    return images[Math.floor(Math.random() * images.length)];
}

const parentTopics = [
    "Phòng Khách", "Phòng Ngủ", "Phòng Bếp", "Phòng Tắm", "Sân Vườn",
    "Văn Phòng", "Decor Trang Trí", "Ánh Sáng", "Thông Minh", "Phong Thủy"
];

const childTopics = [
    ["Sofa", "Kệ Tivi", "Bàn Trà"],
    ["Giường Ngủ", "Tủ Quần Áo", "Bàn Trang Điểm"],
    ["Tủ Bếp", "Bàn Ăn", "Đảo Bếp"],
    ["Lavabo", "Gương", "Kệ Tắm"],
    ["Bàn Ghế Ngoài Trời", "Tiểu Cảnh", "Đèn Sân Vườn"],
    ["Bàn Làm Việc", "Ghế Công Thái Học", "Kệ Sách"],
    ["Tranh Treo Tường", "Đồng Hồ", "Thảm Trải Sàn"],
    ["Đèn Chùm", "Đèn Led", "Đèn Bàn"],
    ["Nhà Thông Minh", "Robot Hút Bụi", "Cảm Biến"],
    ["Vật Phẩm Phong Thủy", "Cây Cảnh", "Hồ Cá"]
];

const brands = [
    { name: "IKEA", description: "Thương hiệu nội thất Thụy Điển giá rẻ, thiết kế hiện đại." },
    { name: "Ashley Furniture", description: "Thương hiệu nội thất gia đình số 1 tại Mỹ." },
    { name: "Daiso Korea", description: "Đồ gia dụng tiện ích phong cách Hàn Quốc." }
];

async function main() {
    console.log('🌱 Start seeding...');

    // 1. Clean up optional? No, let's keep existing and add new or upsert.
    // Actually, user wants "Auto fix scripts" so maybe just adding data is safer than wiping.

    // 2. Brands
    console.log('Creating Brands...');
    const brandMap = new Map();
    for (const b of brands) {
        const brand = await prisma.brand.upsert({
            where: { slug: slugify(b.name) },
            update: {},
            create: {
                name: b.name,
                slug: slugify(b.name),
                description: b.description,
                status: 'PUBLISHED'
            }
        });
        brandMap.set(b.name, brand.id);
    }

    // 3. Topics (Parents & Children)
    console.log('Creating Topics...');
    const topicsMap = new Map(); // Name -> ID

    for (let i = 0; i < parentTopics.length; i++) {
        const pName = parentTopics[i];
        const parent = await prisma.topic.upsert({
            where: { slug: slugify(pName) },
            update: { image: getRandomImage() },
            create: {
                name: pName,
                slug: slugify(pName),
                image: getRandomImage(),
                status: 'PUBLISHED'
            }
        });
        topicsMap.set(pName, parent.id);

        // Children
        const children = childTopics[i];
        for (const cName of children) {
            const fullSlug = slugify(pName + '-' + cName); // Avoid collision
            const child = await prisma.topic.upsert({
                where: { slug: slugify(cName) }, // Try simple slug first
                update: { parentId: parent.id },
                create: {
                    name: cName,
                    slug: slugify(cName), // might fail if duplicate across parents, but names are mostly unique here
                    parentId: parent.id,
                    image: getRandomImage(),
                    status: 'PUBLISHED'
                }
            }).catch(async (e) => {
                // Fallback for duplicate slug
                return await prisma.topic.create({
                    data: {
                        name: cName,
                        slug: fullSlug,
                        parentId: parent.id,
                        image: getRandomImage(),
                        status: 'PUBLISHED'
                    }
                })
            });
            topicsMap.set(cName, child.id);
        }
    }

    // 4. Posts
    console.log('Creating Posts...');
    const postTitles = [
        "5 Xu Hướng Thiết Kế Phòng Khách Hiện Đại Năm 2025",
        "Cách Chọn Sofa Phù Hợp Cho Căn Hộ Nhỏ",
        "Bí Quyết Trang Trí Phòng Ngủ Ấm Cúng Cho Mùa Đông",
        "Top 10 Mẫu Tủ Bếp Đẹp Nhất Hiện Nay",
        "Phong Thủy Phòng Làm Việc Giúp Thăng Tiến Sự Nghiệp",
        "Review Chi Tiết Ghế Công Thái Học Ergonomic",
        "Đèn Led Trang Trí: Giải Pháp Ánh Sáng Tiết Kiệm Năng Lượng",
        "Kinh Nghiệm Mua Sắm Nội Thất Online Không Bị Hớ",
        "Biến Ban Công Thành Góc Chill Cực Chill",
        "Tại Sao Nên Sử Dụng Nội Thất Thông Minh?"
    ];

    for (const title of postTitles) {
        const slug = slugify(title);
        // Pick random topic
        const allTopicIds = Array.from(topicsMap.values());
        const randomTopicId = allTopicIds[Math.floor(Math.random() * allTopicIds.length)];

        console.log("Creating Post: " + title);
        await prisma.post.upsert({
            where: { slug },
            update: {},
            create: {
                title,
                slug,
                excerpt: "Bài viết chia sẻ kiến thức bổ ích về nội thất, giúp bạn có ngôi nhà mơ ước...",
                content: `<p>Nội dung chi tiết của bài viết <strong>${title}</strong>...</p><img src="${getRandomImage()}" alt="Example" />`,
                topicId: randomTopicId,
                intent: 'INFORMATIONAL',
                status: 'PUBLISHED',
                thumbnail: getRandomImage(),
                gallery: [getRandomImage(), getRandomImage()]
            }
        });
    }

    // 5. Products
    console.log('Creating Products...');
    const productNames = [
        "Sofa Da Bò Ý Nhập Khẩu Luxury",
        "Giường Ngủ Gỗ Sồi Nga Cao Cấp",
        "Bàn Ăn Mặt Đá Marble 6 Ghế",
        "Tủ Quần Áo Cánh Kính Hiện Đại",
        "Ghế Công Thái Học Ergonomic Pro",
        "Đèn Chùm Pha Lê Tiệp Khắc",
        "Robot Hút Bụi Lau Nhà Thông Minh",
        "Bàn Trà Kính Cường Lực",
        "Kệ Tivi Treo Tường Gỗ Công Nghiệp",
        "Thảm Lông Cừu Trải Sàn Sang Trọng"
    ];

    for (const name of productNames) {
        const slug = slugify(name);
        const allTopicIds = Array.from(topicsMap.values());
        const randomTopicId = allTopicIds[Math.floor(Math.random() * allTopicIds.length)];

        const brandsList = Array.from(brandMap.values());
        const randomBrandId = brandsList[Math.floor(Math.random() * brandsList.length)];

        await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name,
                slug,
                price: "15.000.000đ",
                originalPrice: "20.000.000đ",
                description: `<p>Mô tả sản phẩm <strong>${name}</strong> chất lượng cao...</p>`,
                images: [getRandomImage(), getRandomImage(), getRandomImage()],
                affiliateLink: "https://shopee.vn",
                specs: { "Chất liệu": "Cao cấp", "Bảo hành": "12 Tháng", "Xuất xứ": "Nhập khẩu" },
                topicId: randomTopicId,
                brandId: randomBrandId,
                status: 'PUBLISHED'
            }
        });
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

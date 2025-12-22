
import { PrismaClient } from '@prisma/client'
import { slugify } from '../utils/slugify'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting SEO Content Seeding...')

    // 1. Clean up relevant tables (optional, for safety we might just upsert, but user said "remove surplus")
    // Let's truncate to ensure clean slate for demo, but kept safe if desired. 
    // Given "remove surplus", I will delete existing generic data if possible, or just add new.
    // For this task, let's create robust data.

    // 2. Create Brands
    const brandsData = ['Herman Miller', 'Steelcase', 'IKEA', 'Ashley Furniture', 'Logitech', 'Razer', 'Philips Hue', 'Dyson']
    const brands = []
    for (const name of brandsData) {
        const brand = await prisma.brand.upsert({
            where: { slug: slugify(name) },
            update: {},
            create: { name, slug: slugify(name), description: `Official ${name} products` }
        })
        brands.push(brand)
    }
    console.log(`✅ Seeded ${brands.length} Brands`)

    // 3. Create Hierarchical Topics
    const topicsStructure = [
        {
            name: 'Không gian làm việc',
            children: ['Ghế công thái học', 'Bàn nâng hạ', 'Setup PC', 'Phụ kiện Desktsop']
        },
        {
            name: 'Nội thất phòng khách',
            children: ['Sofa & Salon', 'Kệ Tivi', 'Bàn trà', 'Đèn trang trí']
        },
        {
            name: 'Smart Home',
            children: ['Robot hút bụi', 'Camera an ninh', 'Đèn thông minh', 'Loa thông minh']
        },
        {
            name: 'Sân vườn & Ban công',
            children: ['Cây cảnh', 'Bàn ghế ngoài trời', 'Dụng cụ làm vườn']
        }
    ]

    for (const group of topicsStructure) {
        const parentSlug = slugify(group.name)
        const parent = await prisma.topic.upsert({
            where: { slug: parentSlug },
            update: { parentId: null },
            create: {
                name: group.name,
                slug: parentSlug,
                seoTitle: `Review ${group.name} - Đánh giá nội thất chuyên sâu`,
                seoDesc: `Chuyên mục ${group.name} với hàng trăm bài viết đánh giá chi tiết.`
            }
        })

        for (const childName of group.children) {
            const childSlug = slugify(childName)
            await prisma.topic.upsert({
                where: { slug: childSlug },
                update: { parentId: parent.id },
                create: {
                    name: childName,
                    slug: childSlug,
                    parentId: parent.id,
                    seoTitle: `Top ${childName} tốt nhất 2024`,
                    seoDesc: `Tổng hợp đánh giá ${childName} đáng mua nhất hiện nay.`
                }
            })
        }
    }
    console.log('✅ Seeded Hierarchical Topics')

    // 4. Create Affiliate Products
    // We need some specific products to link in posts
    const productsData = [
        { name: 'Ghế Herman Miller Aeron', price: 25000000, link: 'https://shopee.vn/herman-miller-aeron', brandIndex: 0 },
        { name: 'Ghế Steelcase Leap V2', price: 18000000, link: 'https://lazada.vn/steelcase-leap', brandIndex: 1 },
        { name: 'Bàn Epiphone Standing Desk', price: 8500000, link: 'https://tiki.vn/standing-desk', brandIndex: 2 },
        { name: 'Đèn màn hình Yeelight', price: 1200000, link: 'https://shopee.vn/yeelight-bar', brandIndex: 6 },
        { name: 'Sofa da bò Ý cao cấp', price: 45000000, link: 'https://noithat.vn/sofa-y', brandIndex: 3 },
    ]

    const products = []
    for (const p of productsData) {
        const prod = await prisma.affiliate.create({
            data: {
                name: p.name,
                link: p.link,
                price: p.price,
                type: 'SHOPEE', // simple default
                brandId: brands[p.brandIndex].id
            }
        })
        products.push(prod)
    }
    console.log(`✅ Seeded ${products.length} Products`)

    // 5. Create SEO Standard Posts
    // Long content with HTML, H2, H3, images
    const ergonomicTopic = await prisma.topic.findFirst({ where: { slug: 'ghe-cong-thai-hoc' } })

    if (ergonomicTopic) {
        await prisma.post.create({
            data: {
                title: 'Review ghế công thái học Herman Miller Aeron: Có đáng mức giá 30 triệu?',
                slug: 'review-ghe-herman-miller-aeron-2024',
                excerpt: 'Đánh giá chi tiết "ông vua" ghế công thái học. Liệu sự đầu tư đắt đỏ này có thực sự bảo vệ cột sống của bạn? Cùng mổ xẻ chi tiết.',
                content: `
                    <p>Nếu bạn là người làm việc văn phòng hoặc dân IT chính hiệu, chắc chắn cái tên <strong>Herman Miller Aeron</strong> không còn xa lạ. Được mệnh danh là "chiếc ghế của mọi chiếc ghế", Aeron không chỉ là biểu tượng của sự sang trọng mà còn là đỉnh cao của thiết kế Ergonomic.</p>
                    
                    <h2>1. Thiết kế biểu tượng vượt thời gian</h2>
                    <p>Ra mắt lần đầu năm 1994, Aeron đã thay đổi hoàn toàn cách chúng ta nhìn nhận về ghế văn phòng. Không đệm mút, không da thật, Aeron sử dụng lưới Pellicle độc quyền.</p>
                    <img src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000" alt="Herman Miller Aeron Design" />
                    
                    <h3>Chất liệu lưới Pellicle</h3>
                    <p>Điểm "ăn tiền" nhất chính là lưới Pellicle. Nó không giữ nhiệt như ghế da, giúp bạn ngồi 8-10 tiếng mà không hề bí bách. Độ đàn hồi cực tốt, ôm trọn đường cong cơ thể.</p>

                    <h2>2. Trải nghiệm ngồi thực tế</h2>
                    <p>Cảm giác đầu tiên khi ngồi vào là sự "nâng đỡ". Hệ thống PostureFit SL hỗ trợ xương cùng và thắt lưng cùng lúc, giữ cột sống luôn thẳng tự nhiên.</p>
                    <ul>
                        <li><strong>Ưu điểm:</strong> Thoáng mát, hỗ trợ lưng tuyệt đối, bền bỉ hàng chục năm.</li>
                        <li><strong>Nhược điểm:</strong> Khung ghế cứng, không cho phép ngồi khoanh chân thoải mái. Giá thành rất cao.</li>
                    </ul>

                    <h2>3. Có đáng tiền không?</h2>
                    <p>Với mức giá khoảng 1000$ - 1500$, đây là một khoản đầu tư lớn. Tuy nhiên, với chế độ bảo hành 12 năm và sức khỏe cột sống vô giá, Aeron hoàn toàn xứng đáng.</p>
                    
                    <div class="product-card">
                        <h3>Nơi mua uy tín</h3>
                        <p>Bạn có thể săn sale tại các sàn TMĐT uy tín:</p>
                        <!-- Product Links inserted dynamically in UI usually, but here is content -->
                    </div>
                `,
                publishedAt: new Date(),
                thumbnail: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=1000',
                topicId: ergonomicTopic.id,
                affiliates: {
                    create: [
                        { affiliateId: products[0].id }
                    ]
                }
            }
        })
    }

    const deskTopic = await prisma.topic.findFirst({ where: { slug: 'ban-nang-ha' } })
    if (deskTopic) {
        await prisma.post.create({
            data: {
                title: 'Top 5 Bàn nâng hạ (Standing Desk) tốt nhất cho Setup Minimalist',
                slug: 'top-5-ban-nang-ha-setup-minimalist',
                excerpt: 'Xu hướng làm việc đứng đang lên ngôi. Dưới đây là 5 mẫu bàn nâng hạ động cơ kép êm ái, mặt bàn gỗ sồi bền bỉ cho góc làm việc của bạn.',
                content: `
                    <p>Work from home khiến nhu cầu về một góc làm việc linh hoạt ngày càng tăng. <strong>Bàn nâng hạ</strong> chính là giải pháp hoàn hảo để thay đổi tư thế, giảm đau lưng.</p>
                    
                    <h2>1. Epiphone Smart Desk</h2>
                    <p>Động cơ kép mạnh mẽ, nâng hạ êm ru chỉ trong 10s. Mặt bàn 1m6 rộng rãi.</p>
                    <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000" alt="Office Setup" />
                    
                    <h2>2. IKEA Bekant</h2>
                    <p>Thiết kế đơn giản, bảo hành 10 năm từ IKEA. Tuy nhiên tải trọng không quá lớn.</p>
                    
                    <h2>Tiêu chí chọn bàn</h2>
                    <ol>
                        <li><strong>Động cơ:</strong> Nên chọn Dual Motor để tải khỏe hơn.</li>
                        <li><strong>Mặt bàn:</strong> Gỗ tre hoặc gỗ sồi sẽ bền và đẹp hơn gỗ công nghiệp thường.</li>
                        <li><strong>Bộ nhớ:</strong> Cần có ít nhất 3 vị trí nhớ độ cao.</li>
                    </ol>
                `,
                publishedAt: new Date(),
                thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000',
                topicId: deskTopic.id,
                affiliates: {
                    create: [
                        { affiliateId: products[2].id }
                    ]
                }
            }
        })
    }

    // Add generic posts to fill layout
    const smartHome = await prisma.topic.findFirst({ where: { slug: 'smart-home' } })
    if (smartHome) {
        await prisma.post.create({
            data: {
                title: 'Setup Smart Home chưa đến 10 triệu đồng: Dễ hay khó?',
                slug: 'setup-smart-home-duoi-10-trieu',
                excerpt: 'Hướng dẫn nhập môn nhà thông minh với chi phí thấp: Đèn, Công tắc, Cảm biến.',
                content: '<p>Nội dung đang cập nhật...</p>',
                publishedAt: new Date(),
                thumbnail: 'https://images.unsplash.com/photo-1558002038-1091a1661116?auto=format&fit=crop&q=80&w=1000',
                topicId: smartHome.id
            }
        })
    }

    console.log('✅ Created SEO Standard Posts')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

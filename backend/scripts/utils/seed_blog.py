import logging
from app.services.blog_service import BlogService, ensure_blog_table
from app.schemas.blog import BlogPostCreate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Real-world blog content with high-quality images
BLOG_POSTS = [
    {
        "title": "The Future of Freelancing: AI and Automation",
        "slug": "future-of-freelancing-ai-automation",
        "excerpt": "How Artificial Intelligence is reshaping the gig economy and what freelancers need to do to stay ahead.",
        "content": """
            <h2>The AI Revolution in Freelancing</h2>
            <p>Artificial Intelligence is no longer a futuristic concept; it's here, and it's transforming the way we work. For freelancers, this presents both a challenge and an opportunity.</p>
            
            <h3>Automating the Mundane</h3>
            <p>One of the biggest benefits of AI is its ability to handle repetitive tasks. Tools like ChatGPT can generate content outlines, while Midjourney can create polished visuals in seconds. This allows freelancers to focus on high-value, creative work.</p>
            
            <h3>New Skill Requirements</h3>
            <p>As AI tools become more prevalent, the demand for "AI whisperers" or prompt engineers is skyrocketing. Freelancers who can effectively leverage these tools will have a significant competitive advantage.</p>
            
            <h3>The Human Touch</h3>
            <p>Despite the advancements in AI, the human element remains irreplaceable. Empathy, strategic thinking, and complex problem-solving are skills that AI has yet to master. Freelancers should double down on these soft skills to differentiate themselves.</p>
            
            <p>In conclusion, AI is not here to replace freelancers but to augment their capabilities. Embrace the change, learn the tools, and ride the wave of the future.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        "author": "Sarah Connor",
        "tags": ["AI", "Freelancing", "Future of Work", "Automation"],
        "is_published": True,
        "is_news_trend": False
    },
    {
        "title": "Mastering Remote Work: Tips for Staying Productive",
        "slug": "mastering-remote-work-productivity-tips",
        "excerpt": "Essential strategies for maintaining focus and work-life balance when your home is your office.",
        "content": """
            <h2>The Remote Work Reality</h2>
            <p>Remote work offers unparalleled freedom, but it also comes with its own set of challenges. Distractions are everywhere, and the line between work and life can easily blur.</p>
            
            <h3>Create a Dedicated Workspace</h3>
            <p>Having a specific area for work helps signal to your brain that it's time to focus. It doesn't have to be a separate room; even a dedicated corner of a table can work.</p>
            
            <h3>Stick to a Schedule</h3>
            <p>Routine is your friend. Set regular working hours and stick to them. This not only helps you stay productive but also ensures you can disconnect at the end of the day.</p>
            
            <h3>Take Regular Breaks</h3>
            <p>The Pomodoro Technique is a favorite among freelancers. Work for 25 minutes, then take a 5-minute break. This keeps your mind fresh and prevents burnout.</p>
            
            <p>Remember, productivity is a marathon, not a sprint. Find what works for you and stick with it.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=1000&auto=format&fit=crop",
        "author": "John Doe",
        "tags": ["Remote Work", "Productivity", "Lifestyle"],
        "is_published": True,
        "is_news_trend": False
    },
    {
        "title": "Crypto Payments: A Game Changer for Global Freelancers",
        "slug": "crypto-payments-global-freelancers",
        "excerpt": "Why more freelancers are opting for cryptocurrency payments to avoid high fees and delays.",
        "content": """
            <h2>The Problem with Traditional Payments</h2>
            <p>For international freelancers, getting paid can be a headache. High transaction fees, unfavorable exchange rates, and days-long processing times eat into earnings.</p>
            
            <h3>Enter Cryptocurrency</h3>
            <p>Crypto payments, particularly stablecoins like USDC, offer a solution. Transactions are near-instant, fees are negligible, and they are borderless.</p>
            
            <h3>Benefits of Crypto</h3>
            <ul>
                <li><strong>Speed:</strong> Get paid in minutes, not days.</li>
                <li><strong>Low Fees:</strong> Keep more of what you earn.</li>
                <li><strong>Global Access:</strong> Work with clients anywhere in the world without banking restrictions.</li>
            </ul>
            
            <p>As platforms like MegiLance integrate crypto payments, the barrier to entry for global talent is lower than ever.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000&auto=format&fit=crop",
        "author": "Satoshi Nakamoto",
        "tags": ["Crypto", "Blockchain", "Payments", "Freelancing"],
        "is_published": True,
        "is_news_trend": True
    },
    {
        "title": "Top 5 Skills in Demand for 2025",
        "slug": "top-5-skills-demand-2025",
        "excerpt": "Stay ahead of the curve by mastering these high-demand skills for the coming year.",
        "content": """
            <h2>What Clients Want in 2025</h2>
            <p>The job market is evolving rapidly. To stay relevant, freelancers need to continuously upskill. Here are the top 5 skills clients are looking for:</p>
            
            <h3>1. AI & Machine Learning</h3>
            <p>Understanding how to build, train, or simply use AI models is the most valuable skill today.</p>
            
            <h3>2. Blockchain Development</h3>
            <p>With the rise of Web3, developers who understand Solidity and smart contracts are in high demand.</p>
            
            <h3>3. Cybersecurity</h3>
            <p>As digital threats grow, so does the need for experts who can protect data and systems.</p>
            
            <h3>4. Data Analysis</h3>
            <p>Data is the new oil. Companies need professionals who can interpret data to drive business decisions.</p>
            
            <h3>5. Content Creation (Video)</h3>
            <p>Video content is king. Skills in video editing and production are essential for modern marketing.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
        "author": "Jane Smith",
        "tags": ["Skills", "Career Advice", "2025 Trends"],
        "is_published": True,
        "is_news_trend": False
    },
    {
        "title": "Breaking News: MegiLance Launches AI Matching",
        "slug": "megilance-launches-ai-matching",
        "excerpt": "Our new AI-powered matching system connects freelancers with the perfect projects instantly.",
        "content": """
            <h2>A New Era of Hiring</h2>
            <p>We are thrilled to announce the launch of our new AI Matching system. Gone are the days of endless scrolling and bidding.</p>
            
            <h3>How It Works</h3>
            <p>Our advanced algorithms analyze freelancer profiles, skills, and past performance to match them with job postings that fit them perfectly. This saves time for both clients and freelancers.</p>
            
            <h3>Why It Matters</h3>
            <p>Efficiency is key in the gig economy. By reducing the time to hire, we enable projects to start sooner and freelancers to earn faster.</p>
            
            <p>Try it out today and experience the future of hiring on MegiLance.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop",
        "author": "MegiLance Team",
        "tags": ["MegiLance", "News", "Feature Launch", "AI"],
        "is_published": True,
        "is_news_trend": True
    },
    {
        "title": "The Rise of the Digital Nomad",
        "slug": "rise-of-digital-nomad",
        "excerpt": "Exploring the lifestyle of working from anywhere and how to make it sustainable.",
        "content": """
            <h2>Work from Anywhere</h2>
            <p>The digital nomad lifestyle is the dream for many. Traveling the world while earning a living seems too good to be true, but for thousands, it's reality.</p>
            
            <h3>Challenges on the Road</h3>
            <p>Reliable internet, time zone differences, and loneliness are real issues. Successful nomads plan ahead and build communities wherever they go.</p>
            
            <h3>Tools of the Trade</h3>
            <p>A good laptop, noise-canceling headphones, and a portable Wi-Fi hotspot are non-negotiable. Apps like Slack and Zoom keep teams connected across continents.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
        "author": "Alex Roamer",
        "tags": ["Digital Nomad", "Travel", "Remote Work"],
        "is_published": True,
        "is_news_trend": False
    },
    {
        "title": "Web3 and the Creator Economy",
        "slug": "web3-creator-economy",
        "excerpt": "How blockchain is giving power back to creators and enabling new monetization models.",
        "content": """
            <h2>Ownership is Key</h2>
            <p>Web2 platforms own your audience. Web3 platforms let you own your content and your community. This shift is massive for creators.</p>
            
            <h3>NFTs and Access</h3>
            <p>Creators can use NFTs to gate exclusive content, creating a direct line of revenue from their biggest fans without a middleman taking a cut.</p>
            
            <h3>The Future is Decentralized</h3>
            <p>As we move towards a decentralized web, creators will have more autonomy and financial freedom than ever before.</p>
        """,
        "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop",
        "author": "Crypto King",
        "tags": ["Web3", "Creator Economy", "Blockchain"],
        "is_published": True,
        "is_news_trend": True
    }
]

def seed_blog():
    try:
        ensure_blog_table()
        logger.info("Blog table ensured.")

        for post_data in BLOG_POSTS:
            existing = BlogService.get_post_by_slug(post_data["slug"])
            if existing:
                logger.info(f"Post '{post_data['title']}' already exists. Skipping.")
                continue
                
            post = BlogPostCreate(**post_data)
            BlogService.create_post(post)
            logger.info(f"Created post: {post.title}")
            
        logger.info("Blog seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"An error occurred during seeding: {e}")

if __name__ == "__main__":
    seed_blog()

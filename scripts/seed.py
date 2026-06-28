"""Populate the laptops table with sample Tajikistan-market listings (idempotent per brand+model)
and ensure a default admin user exists (idempotent per email)."""
import asyncio
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from src.core.security import get_password_hash
from src.db.session import async_session_maker
from src.models.laptop import Laptop
from src.models.user import User
from src.models.brand import Brand
from src.models.sale import Sale
from src.models.order import Order


ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@somoncomp.tj")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "ChangeMe123!")

SEED_LAPTOPS = [
    # ── Budget (under 7,000 TJS) ──────────────────────────────────────────
    dict(
        brand="Acer", model_name="Aspire 3 A315", cpu="Intel Core i3-1215U",
        ram_gb=8, storage_gb=256, gpu="Intel UHD Graphics", price_tjs=4990.00,
        stock_quantity=15, warranty_months=12,
        description="Самои арзон дар анбор — барои браузинг, ҳуҷҷатҳо ва дарсҳои онлайн.",
    ),
    dict(
        brand="Acer", model_name="Swift 3 SF314", cpu="AMD Ryzen 5 7530U",
        ram_gb=8, storage_gb=512, gpu="AMD Radeon Graphics", price_tjs=6500.00,
        stock_quantity=11, warranty_months=12,
        description="Хеле сабук ва тез — барои донишҷӯён ва мусофирон, ки суръат мехоҳанд.",
    ),
    # ── Mid-range (7,000–12,000 TJS) ─────────────────────────────────────
    dict(
        brand="ASUS", model_name="Vivobook 15 X1504", cpu="Intel Core i5-1334U",
        ram_gb=16, storage_gb=512, gpu="Intel Iris Xe", price_tjs=7490.00,
        stock_quantity=12, warranty_months=12,
        description="Лаптопи боэтимоди ҳаррӯза барои донишҷӯён ва корҳои дафтарӣ.",
    ),
    dict(
        brand="Dell", model_name="Inspiron 15 3520", cpu="Intel Core i5-1235U",
        ram_gb=8, storage_gb=512, gpu="Intel Iris Xe", price_tjs=7900.00,
        stock_quantity=10, warranty_months=12,
        description="Dell-и арзони ҳаррӯза бо сохтори мустаҳкам ва иҷроиши равон.",
    ),
    dict(
        brand="Lenovo", model_name="IdeaPad Slim 5", cpu="AMD Ryzen 5 7530U",
        ram_gb=16, storage_gb=512, gpu="AMD Radeon Graphics", price_tjs=8200.00,
        stock_quantity=8, warranty_months=12,
        description="Борик ва сабук, барои фароғат дар байни кампусҳои Душанбе.",
    ),
    dict(
        brand="HP", model_name="ProBook 450 G10", cpu="Intel Core i5-1335U",
        ram_gb=16, storage_gb=512, gpu="Intel Iris Xe", price_tjs=9800.00,
        stock_quantity=9, warranty_months=24,
        description="Боэтимодии синфи тиҷоратӣ бо корпуси дарозумр ва батареяи тӯлонӣ.",
    ),
    dict(
        brand="HP", model_name="Pavilion 15", cpu="Intel Core i7-1355U",
        ram_gb=16, storage_gb=1024, gpu="Intel Iris Xe", price_tjs=10500.00,
        stock_quantity=6, warranty_months=24,
        description="Мошини мувозинатноки миёна бо SSD-и калон, барои касбҳои серкор.",
    ),
    dict(
        brand="Lenovo", model_name="ThinkPad E15 Gen 4", cpu="Intel Core i5-1235U",
        ram_gb=16, storage_gb=512, gpu="Intel Iris Xe", price_tjs=10990.00,
        stock_quantity=6, warranty_months=24,
        description="Устувории афсонавии ThinkPad барои касбиёне, ки асп боэтимод мехоҳанд.",
    ),
    dict(
        brand="Lenovo", model_name="IdeaPad Gaming 3", cpu="Intel Core i5-12500H",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 3050 6GB", price_tjs=11990.00,
        stock_quantity=7, warranty_months=12,
        description="Техникаи бозӣ бидуни нархи баланд — барои бозиҳои esports хуб аст.",
    ),
    dict(
        brand="HP", model_name="Envy x360 15", cpu="AMD Ryzen 5 7530U",
        ram_gb=16, storage_gb=512, gpu="AMD Radeon RX Vega 7", price_tjs=12990.00,
        stock_quantity=4, warranty_months=24,
        description="2-дар-1 бо экрани ламсии OLED, барои эҷодкорони касбӣ мувофиқ аст.",
    ),
    # ── Upper mid (13,000–17,000 TJS) ────────────────────────────────────
    dict(
        brand="MSI", model_name="Thin GF63", cpu="Intel Core i5-12450H",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 2050 4GB", price_tjs=13490.00,
        stock_quantity=5, warranty_months=12,
        description="Лаптопи бозии борик бо графикаи RTX барои бозӣ ва кори эҷодӣ.",
    ),
    dict(
        brand="ASUS", model_name="ZenBook 14 OLED", cpu="AMD Ryzen 7 7745H",
        ram_gb=16, storage_gb=512, gpu="AMD Radeon 780M", price_tjs=13990.00,
        stock_quantity=4, warranty_months=12,
        description="Экрани олии OLED бо иҷроиши AMD Ryzen дар ҷисми борики лукс.",
    ),
    dict(
        brand="ASUS", model_name="TUF Gaming F15", cpu="Intel Core i5-12500H",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 3050 6GB", price_tjs=12490.00,
        stock_quantity=6, warranty_months=24,
        description="Ба стандарти MIL-SPEC сохта шудааст — барои давраҳои шадиди бозӣ мустаҳкам аст.",
    ),
    dict(
        brand="Acer", model_name="Nitro 5 AN515", cpu="AMD Ryzen 5 7535HS",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 2050 4GB", price_tjs=14500.00,
        stock_quantity=5, warranty_months=12,
        description="Лаптопи бозии ибтидоӣ бо якҷоягии тези Ryzen + RTX бо нархи дастрас.",
    ),
    dict(
        brand="Lenovo", model_name="Yoga Slim 7 Pro", cpu="AMD Ryzen 7 7745H",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 3050 4GB", price_tjs=15500.00,
        stock_quantity=3, warranty_months=12,
        description="Лаптопи борики лукс бо GPU-и алоҳида барои эҷодкороне, ки ҳам қобилият ва ҳам ҳаракатпазириро мехоҳанд.",
    ),
    dict(
        brand="Dell", model_name="XPS 13", cpu="Intel Core i7-1360P",
        ram_gb=16, storage_gb=512, gpu="Intel Iris Xe", price_tjs=15990.00,
        stock_quantity=4, warranty_months=24,
        description="Ультрабуки лукс бо экрани қариб бепарча, барои сафар ва пешниҳодҳо сохта шудааст.",
    ),
    # ── Premium (17,000+ TJS) ─────────────────────────────────────────────
    dict(
        brand="Apple", model_name="MacBook Air 13 (M2)", cpu="Apple M2",
        ram_gb=8, storage_gb=256, gpu="Apple 10-core GPU", price_tjs=17500.00,
        stock_quantity=5, warranty_months=12,
        description="Бефан, ором ва хеле самаранок — дӯстдоштаи тарроҳон ва барномасозон.",
    ),
    dict(
        brand="HP", model_name="OMEN 16", cpu="Intel Core i7-12700H",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 3060 6GB", price_tjs=19900.00,
        stock_quantity=3, warranty_months=24,
        description="Қудрати бозии флагмани OMEN бо экрани 165Hz ва тарҳи термалии пешрафта.",
    ),
    dict(
        brand="ASUS", model_name="ROG Strix G16", cpu="Intel Core i7-13650HX",
        ram_gb=32, storage_gb=1024, gpu="NVIDIA RTX 4060 8GB", price_tjs=21990.00,
        stock_quantity=3, warranty_months=24,
        description="Мошини бозии баланд бо экрани 165Hz ва захираи ҳарорати ҷиддӣ.",
    ),
    dict(
        brand="MSI", model_name="Pulse 15 B13V", cpu="Intel Core i7-13700H",
        ram_gb=16, storage_gb=512, gpu="NVIDIA RTX 4070 8GB", price_tjs=24990.00,
        stock_quantity=2, warranty_months=12,
        description="Иҷроиши бозии дараҷаи олӣ RTX 4070 дар ҷисми хеле борик.",
    ),
    dict(
        brand="Apple", model_name="MacBook Pro 14 (M3)", cpu="Apple M3",
        ram_gb=8, storage_gb=512, gpu="Apple 10-core GPU", price_tjs=27900.00,
        stock_quantity=2, warranty_months=12,
        description="Қудратмандтарин лаптопи 14-дюймии Apple — асбоби касбӣ барои эҷодкорони касбӣ.",
    ),
]


async def seed() -> None:
    async with async_session_maker() as session:
        added = 0
        for data in SEED_LAPTOPS:
            existing = await session.execute(
                select(Laptop.id).where(
                    Laptop.brand == data['brand'],
                    Laptop.model_name == data['model_name'],
                ).limit(1)
            )
            if existing.scalar_one_or_none() is None:
                session.add(Laptop(**data))
                added += 1

        if added:
            await session.commit()
            print(f"Seeded {added} new laptops.")
        else:
            print("All laptops already present, skipping seed.")

        existing_admin = await session.execute(
            select(User.id).where(User.email == ADMIN_EMAIL).limit(1)
        )
        if existing_admin.scalar_one_or_none() is None:
            session.add(User(
                email=ADMIN_EMAIL,
                hashed_password=get_password_hash(ADMIN_PASSWORD),
                is_active=True,
                is_admin=True,
            ))
            await session.commit()
            print(f"Created admin user: {ADMIN_EMAIL} / {ADMIN_PASSWORD} (change this password after logging in).")
        else:
            print(f"Admin user {ADMIN_EMAIL} already exists, skipping.")


if __name__ == "__main__":
    asyncio.run(seed())

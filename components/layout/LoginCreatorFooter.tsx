import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const CREATOR_URL = "https://tecalediaz.com";

export function LoginCreatorFooter() {
  return (
    <footer className="login-creator-footer">
      <p className="login-creator-footer__text">Página creada y diseñada por</p>
      <div className="login-creator-footer__brand-row">
        <Link
          href={CREATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="login-creator-footer__brand"
          aria-label="tecalediaz.com"
        >
          <Image
            src="/tecalediaz-logo-white.png"
            alt="tecalediaz"
            width={120}
            height={16}
            className="login-creator-footer__logo"
          />
        </Link>
        <Link
          href={CREATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="login-creator-footer__link-btn liquid-glass-btn liquid-glass-btn-icon"
          aria-label="Visitar tecalediaz.com"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </footer>
  );
}

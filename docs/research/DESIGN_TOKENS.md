# Design Tokens — Référence Maki, adaptation Koto

Audit réalisé le 11 août 2026 sur les pages d’accueil, clients et tarifs de Maki People avec Chrome.

## Couleurs

- Fond principal chaud : `--koto-paper: #FFFCF8`.
- Texte principal aubergine : `--koto-ink: #241B38`.
- Surface sombre : `--koto-black: #171126`.
- Accent d'action corail : `--koto-accent: #FF7A59`.
- Accent d'état violet : `--koto-violet: #6C4CF1`.
- Surface secondaire lavande : `--koto-surface: #F3EFFF`.
- Bordure lilas : `--koto-line: #E4DDF0`.
- Texte secondaire prune : `--koto-muted: #6E647A`.

Cette palette conserve le contraste et la sobriété du système tout en donnant à Astrapio une signature distincte des interfaces vert menthe du marché.

## Typographie

- Texte : Inter, 16 px par défaut.
- Titres : Radio Canada, poids 500.
- H1 bureau observé : 64 px, interligne 70.4 px.
- H2 bureau observé : 48 px, interligne 52.8 px.
- Les tailles Koto utilisent `clamp()` pour conserver ces proportions sur mobile.

## Géométrie

- Largeur éditoriale Koto : 1168 px.
- Boutons principaux : rayon 8 px, environ 12 × 24 px sur la référence.
- Cartes : rayon 8 px, bordure 1 px.
- Sections : grandes respirations verticales de 80 à 160 px.

## Mouvement

- Révélations discrètes : opacité et translation verticale de 30 px.
- Durée moyenne : 650 ms.
- Marquees continus réservés aux logos et photos.
- Toutes les animations sont neutralisées avec `prefers-reduced-motion`.

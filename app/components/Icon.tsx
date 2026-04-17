import type { SVGProps } from "react";
import {
  GitCommit,
  GitBranch,
  Folder,
  File,
  Archive,
  Cloud,
  Search,
  Bell,
  Settings,
  ArrowRight,
  Link as LinkIcon,
  Star,
  GitFork,
  Users,
  Copy,
  ExternalLink,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Book,
  Terminal,
  EyeOff,
  Circle,
  GitCompare,
  Sparkles,
  Tag,
  Play
} from "lucide-react";

export type IconName =
  | "timeline"
  | "branch"
  | "folder"
  | "file"
  | "stash"
  | "cloud"
  | "search"
  | "bell"
  | "settings"
  | "arrow-right"
  | "link"
  | "star"
  | "fork"
  | "users"
  | "copy"
  | "external"
  | "plus"
  | "minus"
  | "chevron-down"
  | "chevron-right"
  | "book"
  | "terminal"
  | "eye-off"
  | "dot"
  | "compare"
  | "sparkle"
  | "tag"
  | "play";

const iconMap: Record<IconName, any> = {
  timeline: GitCommit,
  branch: GitBranch,
  folder: Folder,
  file: File,
  stash: Archive,
  cloud: Cloud,
  search: Search,
  bell: Bell,
  settings: Settings,
  "arrow-right": ArrowRight,
  link: LinkIcon,
  star: Star,
  fork: GitFork,
  users: Users,
  copy: Copy,
  external: ExternalLink,
  plus: Plus,
  minus: Minus,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  book: Book,
  terminal: Terminal,
  "eye-off": EyeOff,
  dot: Circle,
  compare: GitCompare,
  sparkle: Sparkles,
  tag: Tag,
  play: Play,
};

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function Icon({
  name,
  size = 18,
  ...props
}: IconProps & { name: IconName }) {
  const Comp = iconMap[name];
  if (!Comp) return null;
  return <Comp size={size} {...(props as any)} />;
}

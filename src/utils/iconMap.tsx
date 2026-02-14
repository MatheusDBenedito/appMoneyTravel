import {
    Wallet, Coffee, Car, Home, ShoppingBag, Film, Plane, Heart,
    Utensils, Bus, Train, Hotel, Bed, Gift, Ticket, Music,
    Camera, Map, Star, DollarSign, CreditCard, Smartphone,
    Wifi, Zap, Droplet, Archive, Briefcase, Calculator,
    Calendar, Cloud, Code, Compass, Database, Disc,
    Feather, FileText, Flag, Folder, Globe, Headphones,
    Image, Key, Layers, Layout, LifeBuoy, Link, Lock,
    Mail, MapPin, Mic, Monitor, Moon, Mouse, Package,
    Paperclip, Pen, Phone, PieChart, Play, Power, Printer,
    Radio, RefreshCw, Save, Scissors, Search, Server,
    Settings, Share, Shield, Slash, Sliders, Speaker,
    Sun, Table, Tag, Target, Terminal, Thermometer,
    ThumbsUp, ToggleLeft, Tool, Trash, Truck, Tv,
    Twitter, Type, Umbrella, Unlock, Upload, User,
    Users, Video, Voicemail, Volume, Watch, Wind,
    X, ZoomIn
} from 'lucide-react';
import React from 'react';

export const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Wallet, Coffee, Car, Home, ShoppingBag, Film, Plane, Heart,
    Utensils, Bus, Train, Hotel, Bed, Gift, Ticket, Music,
    Camera, Map, Star, DollarSign, CreditCard, Smartphone,
    Wifi, Zap, Droplet, Archive, Briefcase, Calculator,
    Calendar, Cloud, Code, Compass, Database, Disc,
    Feather, FileText, Flag, Folder, Globe, Headphones,
    Image, Key, Layers, Layout, LifeBuoy, Link, Lock,
    Mail, MapPin, Mic, Monitor, Moon, Mouse, Package,
    Paperclip, Pen, Phone, PieChart, Play, Power, Printer,
    Radio, RefreshCw, Save, Scissors, Search, Server,
    Settings, Share, Shield, Slash, Sliders, Speaker,
    Sun, Table, Tag, Target, Terminal, Thermometer,
    ThumbsUp, ToggleLeft, Tool, Trash, Truck, Tv,
    Twitter, Type, Umbrella, Unlock, Upload, User,
    Users, Video, Voicemail, Volume, Watch, Wind,
    X, ZoomIn
};

export const getIcon = (iconName: string): React.ComponentType<{ size?: number; className?: string }> => {
    return iconMap[iconName] || Wallet; // Default to Wallet if not found
};

export const availableIcons = Object.keys(iconMap).sort();

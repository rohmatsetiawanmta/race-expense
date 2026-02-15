import * as Icons from "lucide-react";

const CategoryIcon = ({ iconName, className = "w-4 h-4" }) => {
  // Ambil komponen ikon berdasarkan string nama dari Lucide
  const IconComponent = Icons[iconName];

  if (!IconComponent) {
    // Ikon default jika nama tidak ditemukan
    return <Icons.HelpCircle className={className} />;
  }

  return <IconComponent className={className} />;
};

export default CategoryIcon;

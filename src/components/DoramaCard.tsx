import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Eye } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  tags: string[] | null;
  views_count: number | null;
}

interface DoramaCardProps {
  video: Video;
}

export const DoramaCard = ({ video }: DoramaCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dorama/${video.id}`);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-rose-100"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Fixed size container for thumbnail */}
        <div className="relative overflow-hidden rounded-t-lg" style={{ width: '100%', height: '480px' }}>
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            style={{ minHeight: '480px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-rose-900 mb-2 line-clamp-2 group-hover:text-rose-700 transition-colors">
            {video.title}
          </h3>
          
          {video.description && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {video.description}
            </p>
          )}

          {video.tags && (
            <div className="flex flex-wrap gap-1 mb-3">
              {video.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-200"
                >
                  {tag}
                </Badge>
              ))}
              {video.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{video.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {video.views_count || 0} views
            </span>
            <span className="text-rose-600 font-medium group-hover:text-rose-700">
              Assistir →
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
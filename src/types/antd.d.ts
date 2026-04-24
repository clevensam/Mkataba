import React from 'react';
import type { CardProps as AntCardProps, CardMetaProps } from 'antd/es/card';

declare module 'antd' {
  export const Card: React.FC<AntCardProps> & {
    Meta: React.FC<CardMetaProps>;
  };
}
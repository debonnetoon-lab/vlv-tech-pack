import React from "react";
import { Document } from "@react-pdf/renderer";
import { Collection } from "@/types/tech-pack";
import { TechPackPages } from "./TechPackDocument";

interface Props {
  collection: Collection;
}

export const CollectionDocument = ({ collection }: Props) => {
  return (
    <Document>
      {collection.articles.map((article) => (
        <TechPackPages 
          key={article.id} 
          article={article} 
          collectionName={collection.name} 
        />
      ))}
    </Document>
  );
};

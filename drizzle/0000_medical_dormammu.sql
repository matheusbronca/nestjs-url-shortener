CREATE TABLE "urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(60) NOT NULL,
	"description" varchar(255),
	"url" text NOT NULL,
	"redirect" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "urls_id_unique" UNIQUE("id"),
	CONSTRAINT "urls_url_unique" UNIQUE("url")
);

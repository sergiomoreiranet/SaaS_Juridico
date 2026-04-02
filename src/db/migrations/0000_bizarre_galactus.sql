CREATE TYPE "public"."role" AS ENUM('admin', 'advogado', 'estagiario');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('pending', 'trial', 'active', 'blocked');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" "tenant_status" DEFAULT 'pending' NOT NULL,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'advogado' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_tenant_id_idx" ON "users" USING btree ("tenant_id","id");
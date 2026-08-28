CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "escoUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerSkill" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 60,
    "level" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerTask" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerKnowledge" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerKnowledge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerAbility" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 60,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerAbility_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerInterest" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 60,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerInterest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerWorkActivity" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerWorkActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerWorkContext" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerWorkContext_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerTool" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerTool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerMarketData" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'VN',
    "localTitle" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "demand" INTEGER,
    "industriesHiring" JSONB,
    "educationRoutes" JSONB,
    "certifications" JSONB,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerMarketData_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerLearningPath" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "tasks" JSONB NOT NULL,
    "projects" JSONB NOT NULL,
    "resources" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareerLearningPath_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerResource" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerResource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CareerRelatedCareer" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "relatedCareerId" TEXT NOT NULL,
    "reason" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 60,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    CONSTRAINT "CareerRelatedCareer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulationDefinition" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "workplace" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'template',
    "duration" INTEGER NOT NULL DEFAULT 45,
    "objectives" JSONB NOT NULL,
    "artifacts" JSONB NOT NULL,
    "evaluationDimensions" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'careertwin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SimulationDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulationTask" (
    "id" TEXT NOT NULL,
    "definitionId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "artifacts" JSONB,
    "options" JSONB NOT NULL,
    "scoringSignals" JSONB NOT NULL,
    "branches" JSONB,
    CONSTRAINT "SimulationTask_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Skill_key_key" ON "Skill"("key");
CREATE UNIQUE INDEX "Skill_escoUri_key" ON "Skill"("escoUri");
CREATE INDEX "Skill_source_idx" ON "Skill"("source");
CREATE UNIQUE INDEX "CareerSkill_careerId_skillId_key" ON "CareerSkill"("careerId", "skillId");
CREATE INDEX "CareerSkill_skillId_idx" ON "CareerSkill"("skillId");
CREATE INDEX "CareerSkill_careerId_importance_idx" ON "CareerSkill"("careerId", "importance");
CREATE INDEX "CareerTask_careerId_order_idx" ON "CareerTask"("careerId", "order");
CREATE UNIQUE INDEX "CareerKnowledge_careerId_name_key" ON "CareerKnowledge"("careerId", "name");
CREATE UNIQUE INDEX "CareerAbility_careerId_name_key" ON "CareerAbility"("careerId", "name");
CREATE UNIQUE INDEX "CareerInterest_careerId_key_key" ON "CareerInterest"("careerId", "key");
CREATE INDEX "CareerInterest_key_idx" ON "CareerInterest"("key");
CREATE UNIQUE INDEX "CareerWorkActivity_careerId_name_key" ON "CareerWorkActivity"("careerId", "name");
CREATE UNIQUE INDEX "CareerWorkContext_careerId_name_key" ON "CareerWorkContext"("careerId", "name");
CREATE UNIQUE INDEX "CareerTool_careerId_name_key" ON "CareerTool"("careerId", "name");
CREATE UNIQUE INDEX "CareerMarketData_careerId_key" ON "CareerMarketData"("careerId");
CREATE UNIQUE INDEX "CareerLearningPath_careerId_level_order_key" ON "CareerLearningPath"("careerId", "level", "order");
CREATE INDEX "CareerLearningPath_careerId_order_idx" ON "CareerLearningPath"("careerId", "order");
CREATE INDEX "CareerResource_careerId_type_idx" ON "CareerResource"("careerId", "type");
CREATE UNIQUE INDEX "CareerRelatedCareer_careerId_relatedCareerId_key" ON "CareerRelatedCareer"("careerId", "relatedCareerId");
CREATE INDEX "CareerRelatedCareer_relatedCareerId_idx" ON "CareerRelatedCareer"("relatedCareerId");
CREATE INDEX "SimulationDefinition_careerId_active_idx" ON "SimulationDefinition"("careerId", "active");
CREATE UNIQUE INDEX "SimulationTask_definitionId_step_key" ON "SimulationTask"("definitionId", "step");

ALTER TABLE "CareerSkill" ADD CONSTRAINT "CareerSkill_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerSkill" ADD CONSTRAINT "CareerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerTask" ADD CONSTRAINT "CareerTask_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerKnowledge" ADD CONSTRAINT "CareerKnowledge_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerAbility" ADD CONSTRAINT "CareerAbility_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerInterest" ADD CONSTRAINT "CareerInterest_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerWorkActivity" ADD CONSTRAINT "CareerWorkActivity_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerWorkContext" ADD CONSTRAINT "CareerWorkContext_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerTool" ADD CONSTRAINT "CareerTool_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerMarketData" ADD CONSTRAINT "CareerMarketData_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerLearningPath" ADD CONSTRAINT "CareerLearningPath_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerResource" ADD CONSTRAINT "CareerResource_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerRelatedCareer" ADD CONSTRAINT "CareerRelatedCareer_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerRelatedCareer" ADD CONSTRAINT "CareerRelatedCareer_relatedCareerId_fkey" FOREIGN KEY ("relatedCareerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SimulationDefinition" ADD CONSTRAINT "SimulationDefinition_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SimulationTask" ADD CONSTRAINT "SimulationTask_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "SimulationDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

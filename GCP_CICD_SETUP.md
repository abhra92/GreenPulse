# GCP Cloud Run CI/CD Pipeline Setup Guide

This guide details how to configure Google Cloud Platform (GCP) and GitHub to enable automated builds, testing, and deployment of GreePlus AI to Google Cloud Run.

---

## Step 1: Create a GCP Service Account

You need to create a dedicated Service Account in Google Cloud that has permissions to build and deploy your application.

1. **Open Google Cloud Console:** Go to the [GCP IAM & Admin Service Accounts Console](https://console.cloud.google.com/iam-admin/serviceaccounts).
2. **Select Project:** Ensure your project `greenplus-499311` is selected in the top bar.
3. **Create Service Account:**
   - Click **+ CREATE SERVICE ACCOUNT**.
   - **Name:** `github-deployer`
   - **ID:** `github-deployer`
   - Click **CREATE AND CONTINUE**.
4. **Grant Roles (Permissions):** Add the following roles to the service account:
   - **Cloud Run Developer** (`roles/run.developer` or `roles/run.admin`): Allows creating and updating Cloud Run services.
   - **Cloud Build Editor** (`roles/cloudbuild.builds.editor`): Allows building container images via Cloud Build.
   - **Storage Admin** (`roles/storage.admin`): Allows uploading source code bundles to Cloud Storage.
   - **Artifact Registry Administrator** (`roles/artifactregistry.admin`): Allows managing images in Artifact Registry.
   - Click **CONTINUE**.
5. **Finish:** Click **DONE**.

---

## Step 2: Generate Service Account JSON Key

To authenticate the GitHub Action:

1. Click on the newly created Service Account (`github-deployer@greenplus-499311.iam.gserviceaccount.com`).
2. Go to the **KEYS** tab.
3. Click **ADD KEY** -> **Create new key**.
4. Choose **JSON** format and click **CREATE**.
5. A JSON file containing the credentials will download to your computer. Keep this file secure and **never** commit it to git.

---

## Step 3: Grant Service Account User Role on Default Runtime Service Account

During Cloud Run deployment, the deployer needs permission to assign the runtime service account (usually the Compute Engine default service account) to the service:

1. Go to the [GCP IAM & Admin Console](https://console.cloud.google.com/iam-admin/iam).
2. Find the default Compute Engine service account: `398484959293-compute@developer.gserviceaccount.com`.
3. Click the pencil icon to edit its permissions, or go to the **Service Accounts** page, click the `398484959293-compute` service account, go to the **PERMISSIONS** tab, and click **GRANT ACCESS**.
4. **Principal:** Enter your newly created service account: `github-deployer@greenplus-499311.iam.gserviceaccount.com`.
5. **Role:** Select **Service Account User** (`roles/iam.serviceAccountUser`).
6. Click **SAVE**.

---

## Step 4: Configure GitHub Secrets

1. Open your GitHub Repository: `https://github.com/abhra92/GreenPulse`.
2. Go to **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret**.
4. Add the following secrets:
   - **Name:** `GCP_PROJECT_ID`
     - **Value:** `greenplus-499311`
   - **Name:** `GCP_SA_KEY`
     - **Value:** Paste the *entire* contents of the downloaded JSON key file (include all braces `{}`).

---

## Step 5: Run the Pipeline

Once configured:
1. Push any changes to the `master` branch.
2. Go to the **Actions** tab on your GitHub repository.
3. You will see the pipeline execute:
   - **Test and Build Job:** Installs dependencies (`npm ci`), runs all unit tests (`npm test`), and builds the static output (`npm run build`).
   - **Deploy to GCP Job:** Logs into your GCP project using the secrets key and executes the Cloud Run deployment.

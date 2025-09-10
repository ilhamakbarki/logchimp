pipeline {
    agent {
        kubernetes {
          label 'kube-1'
        }
    }
    environment {
        REGISTRY_HOST = credentials("DOCKER_REGISTRY_HOST")
        DOCKER_IMAGE_BE = "feedback_be"
        DOCKER_IMAGE_FE = "feedback_fe"
        APPROVAL = credentials("APPROVAL_RELEASE")
        NOTIF_API_KEY = credentials('NOTIF_API_KEY')
    }
    stages {
        stage('Build & Push Image Staging & Deploy on Staging') {
            when { branch 'staging_beta_*' }
            steps {
                script{
                    def currentBranch = env.BRANCH_NAME
                    def DOCKER_TARGET_IMAGE = currentBranch.contains('staging_beta_fe') ? DOCKER_IMAGE_FE : DOCKER_IMAGE_BE
                    def tagLatest = "${REGISTRY_HOST}/${DOCKER_TARGET_IMAGE}:staging_beta-latest"
                    def tagBuildNumber = "${REGISTRY_HOST}/${DOCKER_TARGET_IMAGE}:staging_beta-${BUILD_NUMBER}"

                    echo "Start Build Image ${DOCKER_TARGET_IMAGE} Staging"
                    if (currentBranch.contains('staging_beta_fe')) {
                        sh "docker build -t ${tagLatest} -f docker-images/ui.Dockerfile ."
                    } else if (currentBranch.contains('staging_beta_be')) {
                        sh "docker build -t ${tagLatest} -f docker-images/api.Dockerfile ."
                    } else {
                        error "Unsupported branch name for staging build: ${currentBranch}. Expected 'staging_beta_fe' or 'staging_beta_be'."
                    }

                    echo 'Start Pushing Image'
                    docker.withRegistry("https://${REGISTRY_HOST}", 'DOCKER_REGISTRY_USER') {
                        sh "docker push ${tagLatest}"
                        sh "docker tag ${tagLatest} ${tagBuildNumber}"
                        sh "docker push ${tagBuildNumber}"
                    }

                    echo "Start Deploy on Staging"
                    if (currentBranch.contains('staging_beta_fe')) {
                        sh "kubectl set image deployment logchimp-fe logchimp-fe=${tagBuildNumber} -n=logchimp-fe-staging"
                    } else {
                        sh "kubectl set image deployment logchimp-be-app logchimp-be-app=${tagBuildNumber} -n=logchimp-be-staging"
                    }
                }
            }
        }
        stage('Publish Approval') {
            when { tag "release-*" }
            steps {
                script{
                    sendNotification("Waiting Approval to Deploy on Production")
                    def tagName = env.TAG_NAME
                    def approvers = APPROVAL.split(',')
                    def userName = input message: "Do you want to deploy ${tagName}?", submitter: APPROVAL, submitterParameter: "userName"

                    if (!approvers.contains(userName)) {
                        error('This user is not approved to deploy to PROD.')
                    } else {
                        echo "Accepted by ${userName}"
                    }
                }
            }
        }
        stage('Build & Push Image Production & Deploy on Production') {
            when { tag "release-*" }
            steps {
                script{
                    def currentTag = env.TAG_NAME
                    def DOCKER_TARGET_IMAGE = currentTag.contains('release-fe') ? DOCKER_IMAGE_FE : DOCKER_IMAGE_BE

                    def tagLatest = "${REGISTRY_HOST}/${DOCKER_TARGET_IMAGE}:release-latest"
                    def tagBuildNumber = "${REGISTRY_HOST}/${DOCKER_TARGET_IMAGE}:${TAG_NAME}-${BUILD_NUMBER}"

                    echo "Start Build Image ${DOCKER_TARGET_IMAGE} Production"
                    if (currentTag.contains('release-fe')) {
                        sh "docker build -t ${tagLatest} -f docker-images/ui.Dockerfile ."
                    } else if (currentTag.contains('release-be')) {
                        sh "docker build -t ${tagLatest} -f docker-images/api.Dockerfile ."
                    } else {
                        error "Unsupported release build: ${currentTag}. Expected 'release-be-*' or 'release-fe-*'."
                    }

                    echo 'Start Pushing Image'
                    docker.withRegistry("https://${REGISTRY_HOST}", 'DOCKER_REGISTRY_USER') {
                        sh "docker push ${tagLatest}"
                        sh "docker tag ${tagLatest} ${tagBuildNumber}"
                        sh "docker push ${tagBuildNumber}"
                    }

                    echo 'Start Deploy on Production'
                    if (currentTag.contains('release-fe')) {
                        sh "kubectl set image deployment logchimp-fe-app logchimp-fe-app=${tagBuildNumber} -n=logchimp-fe-prod"
                    } else {
                        sh "kubectl set image deployment logchimp-be-app logchimp-be-app=${tagBuildNumber} -n=logchimp-be-prod"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deploy Success...'
            script {
                sendNotification("Success to deploy")
            }
        }
        failure {
            echo 'Deploy Failed.'
            script {
                sendNotification("Failed to deploy")
            }
        }
    }
}

def sendNotification(message) {
    echo 'Sending Notification...'
    def tag = env.TAG_NAME ?: ''
    def branch = env.BRANCH_NAME ?: ''
    def NAME = env.TAG_NAME ?: env.BRANCH_NAME
    def DOCKER_IMAGE = NAME.contains('fe') ? DOCKER_IMAGE_FE : DOCKER_IMAGE_BE
    def cleanJobPath = env.JOB_NAME.replaceFirst('^/job', '').replaceAll('/$', '')
    def formattedJobPath = cleanJobPath.split('/').collect { "job/${it}" }.join('/')
    def link = "${env.PUBLIC_JENKINS_URL}${formattedJobPath}/${env.BUILD_NUMBER}/console"
    sh """
        curl --location 'https://webhooks.socialbot.dev/webhook/jenkins-deploy' \\
            --header 'Content-Type: application/json' \\
            --header 'x-api-key: ${NOTIF_API_KEY}' \\
            --data '{
                "message": "${message} Link : ${link}",
                "service": "${DOCKER_IMAGE}",
                "branch": "${branch}",
                "tag": "${tag}"
            }'
    """
}

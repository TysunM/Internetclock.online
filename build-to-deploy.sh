    echo "3. Monitor site performance"
    echo ""
    echo "Ready for production traffic"
}

# Main execution
main() {
    echo "Starting build-to-deploy pipeline..."
    echo "Domain: $DOMAIN"
    echo "Timestamp: $(date)"
    echo ""

    # Check if running with appropriate permissions
    if [[ $EUID -ne 0 ]] && [[ "$1" != "--build-only" ]]; then
        print_error "This script needs to be run with sudo for deployment"
        echo "Usage: sudo ./build-to-deploy.sh"
        echo "   or: ./build-to-deploy.sh --build-only (for build only)"
        exit 1
    fi

    # Execute pipeline steps
    check_prerequisites
    clean_build
    build_project
    verify_build
    test_build

    # If build-only mode, stop here
    if [[ "$1" == "--build-only" ]]; then
        print_success "Build completed successfully"
        echo "To deploy: sudo ./build-to-deploy.sh"
        exit 0
    fi

    # Continue with deployment
    create_backup
    deploy_to_server
    configure_nginx
    verify_deployment
    show_post_deployment
}

# Run main function with all arguments
main "$@"

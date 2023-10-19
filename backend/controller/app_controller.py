def api_controller(app):
    from controller.event_router import event_router
    from controller.admin_router import admin_router

    app.include_router(event_router, prefix='/events', tags=['Events'])
    app.include_router(admin_router, prefix='/admins', tags=['Admins'])

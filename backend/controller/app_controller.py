def api_controller(app):
    from controller.admin_router import admin_router
    from controller.evaluation_router import evaluation_router
    from controller.event_router import event_router
    from controller.registration_router import registration_router

    app.include_router(event_router, prefix='/events', tags=['Events'])
    app.include_router(registration_router, prefix='/registrations', tags=['Registrations'])
    app.include_router(admin_router, prefix='/admins', tags=['Admins'])
    app.include_router(evaluation_router, prefix='/evaluations', tags=['Evaluations'])
